const chokidar = require('chokidar');
const fs = require("fs-plus");
const rimraf = require("rimraf");
const fromXML = require("from-xml").fromXML;
const toXML = require("to-xml").toXML;
const FlowInProxyEndpoint = require("./live/custom/FlowInProxyEndpoint");
const PolicyLive = require("./live/apiproxy/Policy");
const ProxyEndpointLive = require("./live/apiproxy/ProxyEndpoint");
const TargetEndpointLive = require("./live/apiproxy/TargetEndpoint");
const ResourceLive = require("./live/apiproxy/Resource");

class Watcher {

	constructor(vorpal) {
		this._vorpal = vorpal;
		this._paths = ["./.tmpWatcher/"];
		if(global.prefs.live.validation && fs.existsSync("./apiproxy/")) this._paths.push("./apiproxy/");
		this.start();
	}

	start() {
		this.createTmpFolder();
		this.watcherInit();
	}

	unwatch(files) {
		this._watcher.unwatch(files);
	}

	add(files) {
		this._watcher.add(files);
	}

	stop() {
		for(let index in this._paths) {
			if(fs.existsSync(this._paths[index])) {
				this._watcher.unwatch(this._paths[index]);
				if(index == 0) rimraf.sync(this._paths[0]);
			}
		}
	}

	createTmpFolder() {
		if(fs.existsSync(this._paths[0])) {
			rimraf.sync(this._paths[0]);		
		}
		fs.makeTreeSync(this._paths[0]);
	}

	watcherInit() {
		this._watcher = chokidar.watch(this._paths.map((item) => `${item}**`), {
		  persistent: true,
		  ignoreInitial: true
		})
		.on('change', path => this.processFile(path, 'change'))
		.on('add', path => this.processFile(path, 'add'))
		.on('unlink', path => this.processFile(path, 'unlink'));
	}

	processFile(path, state) {
		let match = null;
		
		if((match = path.match(/(\.tmpWatcher\/)proxyEndpoint_(\w+)_flow_(.*).xml/)) && state === 'change') {
			FlowInProxyEndpoint.process(this._vorpal, match[3], match[2], fs.readFileSync(path, 'utf8'));
		} else if((match = path.match(/(apiproxy\/policies\/)(.*).xml/))) {
			PolicyLive.process(this._vorpal, match[2], state);
		} else if((match = path.match(/(apiproxy\/proxies\/)(.*).xml/))) {
			ProxyEndpointLive.process(this._vorpal, match[2], state);
		} else if((match = path.match(/(apiproxy\/targets\/)(.*).xml/))) {
			TargetEndpointLive.process(this._vorpal, match[2], state);
		} else if((match = path.match(/(apiproxy\/resources\/)(.*)\/(.*)/))) {
			ResourceLive.process(this._vorpal, match[2], match[3], state);
		}
	}
}

module.exports = Watcher;