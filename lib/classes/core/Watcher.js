const chokidar = require('chokidar');
const fs = require("fs-plus");
const rimraf = require("rimraf");
const fromXML = require("from-xml").fromXML;
const toXML = require("to-xml").toXML;
const Cache = require('./Cache');

class Watcher {

	constructor(path, vorpal) {
		this._path = path;
		this._vorpal = vorpal;
	}

	start() {
		this.createTmpFolder();
		this.watcherInit();
	}

	stop() {
		if(fs.existsSync(this._path)) {
			this._watcher.unwatch(this._path);
			rimraf.sync(this._path);
		}
	}

	createTmpFolder() {
		if(fs.existsSync(this._path)) {
			rimraf.sync(this._path);		
		}
		fs.makeTreeSync(this._path);
	}

	watcherInit() {
		this._watcher = chokidar.watch(this._path, {
		  persistent: true
		})
		.on('change', (path, stats) => {
			this.processAddFile(path, stats)
		});
	}

	processAddFile(path, stats) {
		let match = null;
		if(match = path.match(/proxyEndpoint_(\w+)_flow_(.*).xml/)) {
			this.processFlowInProxyEndpoint(match[2], match[1], fs.readFileSync(path, 'utf8'));
		}
	}

	processFlowInProxyEndpoint(nameFlow, nameProxyEndpoint, content) {
		let proxyEndpointContent = fs.readFileSync(`./apiproxy/proxies/${nameProxyEndpoint}.xml`, 'utf8');
		let json = fromXML(proxyEndpointContent);
		let flowIndex = -1;
		for(let index in json.ProxyEndpoint.Flows.Flow) {
			if(json.ProxyEndpoint.Flows.Flow[index]["@name"] == nameFlow) flowIndex = index;
		}

		if(flowIndex !== -1) {
			let newFlow = fromXML(content);
			if(JSON.stringify(json.ProxyEndpoint.Flows.Flow[flowIndex]) !== JSON.stringify(newFlow.Flow) && this.validationFlowInProxyEndpoint(newFlow)) {
				json.ProxyEndpoint.Flows.Flow[flowIndex] = newFlow.Flow;

				fs.writeFileSync(`./apiproxy/proxies/${nameProxyEndpoint}.xml`, toXML(json, null, 2), { encoding: 'utf8'});
				this._vorpal.ui.imprint();
				this._vorpal.log(global.chalk.green(`'${nameFlow}' in '${nameProxyEndpoint}' was saved in './apiproxy/proxies/${nameProxyEndpoint}.xml' file !`));	
			}
		}
	}

	validationFlowInProxyEndpoint(json) {
		
		let policiesFiles = fs.listSync("./apiproxy/policies/", ["xml"]);
		let policiesWrited = json.Flow.Request.Step.map((item) => `apiproxy/policies/${item.Name}.xml`);

		for(let index in policiesWrited) {
			if(policiesFiles.indexOf(policiesWrited[index]) === -1) {
				Cache.load("./apiproxy/");
				this._vorpal.ui.imprint();
				this._vorpal.log(global.chalk.red(`${json.Flow.Request.Step[index].Name} policy doesn't exists!`));
				return false;
			}
		}

		return true;
		
	}
}

module.exports = Watcher;