const fs = require("fs-plus");
const rimraf = require("rimraf");
const fromXML = require("from-xml").fromXML;
const toXML = require("to-xml").toXML;

class FlowInProxyEndpoint {

	constructor(vorpal, nameFlow, nameProxyEndpoint, content) {
		this._vorpal = vorpal;
		this._nameFlow = nameFlow;
		this._nameProxyEndpoint = nameProxyEndpoint;
		this._content = content;
	}

	static process(vorpal, nameFlow, nameProxyEndpoint, content) {
		let me = new FlowInProxyEndpoint(vorpal, nameFlow, nameProxyEndpoint, content);
		me.process();
	}

	process() {
		let proxyEndpointContent = fs.readFileSync(`./apiproxy/proxies/${this._nameProxyEndpoint}.xml`, 'utf8');
		let json = fromXML(proxyEndpointContent);
		let flowIndex = -1;
		for(let index in json.ProxyEndpoint.Flows.Flow) {
			if(json.ProxyEndpoint.Flows.Flow[index]["@name"] == this._nameFlow) flowIndex = index;
		}

		if(flowIndex !== -1) {
			let newFlow = fromXML(this._content);
			if(JSON.stringify(json.ProxyEndpoint.Flows.Flow[flowIndex]) !== JSON.stringify(newFlow.Flow) && this.validation(newFlow)) {
				json.ProxyEndpoint.Flows.Flow[flowIndex] = newFlow.Flow;

				fs.writeFileSync(`./apiproxy/proxies/${this._nameProxyEndpoint}.xml`, toXML(json, null, 2), { encoding: 'utf8'});
				this._vorpal.ui.imprint();
				this._vorpal.log(global.chalk.green(`'${this._nameFlow}' in '${this._nameProxyEndpoint}' was saved in './apiproxy/proxies/${this._nameProxyEndpoint}.xml' file !`));	
			}
		}
	}

	validation(json) {
		
		let policiesFiles = fs.listSync("./apiproxy/policies/", ["xml"]);
		let policiesWrited = json.Flow.Request.Step.map((item) => `apiproxy/policies/${item.Name}.xml`);

		for(let index in policiesWrited) {
			if(policiesFiles.indexOf(policiesWrited[index]) === -1) {
				this._vorpal.ui.imprint();
				this._vorpal.log(global.chalk.red(`${json.Flow.Request.Step[index].Name} policy doesn't exists!`));
				return false;
			}
		}

		return true;
	}
}

module.exports = FlowInProxyEndpoint;