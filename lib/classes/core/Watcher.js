const chokidar = require('chokidar');
const fs = require("fs-plus");
const rimraf = require("rimraf");
const fromXML = require("from-xml").fromXML;
const toXML = require("to-xml").toXML;
const FlowInProxyEndpoint = require("./live/custom/FlowInProxyEndpoint");
const PolicyAdd = require("./live/apiproxy/PolicyAdd");
const PolicyRemove = require("./live/apiproxy/PolicyRemove");
const PolicyChange = require("./live/apiproxy/PolicyChange");
const ProxyEndpointAdd = require("./live/apiproxy/ProxyEndpointAdd");
const ProxyEndpointRemove = require("./live/apiproxy/ProxyEndpointRemove");
const ProxyEndpointChange = require("./live/apiproxy/ProxyEndpointChange");
const TargetEndpointAdd = require("./live/apiproxy/TargetEndpointAdd");
const TargetEndpointRemove = require("./live/apiproxy/TargetEndpointRemove");
const TargetEndpointChange = require("./live/apiproxy/TargetEndpointChange");

class Watcher {

	constructor(vorpal) {
		this._vorpal = vorpal;
		this._paths = ["./.tmpWatcher/"];
		if(global.prefs.live.validation) this._paths.push("./apiproxy/");
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
		if(fs.existsSync(this._paths[0])) {
			this._watcher.unwatch(this._paths[0]);
			rimraf.sync(this._paths[0]);
		}
	}

	createTmpFolder() {
		if(fs.existsSync(this._paths[0])) {
			rimraf.sync(this._paths[0]);		
		}
		fs.makeTreeSync(this._paths[0]);
	}

	watcherInit() {
		this._watcher = chokidar.watch(this._paths, {
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
		} else if((match = path.match(/(apiproxy\/policies\/)(.*).xml/)) && state === 'add') {
			PolicyAdd.process(this._vorpal, match[2]);
		} else if((match = path.match(/(apiproxy\/policies\/)(.*).xml/)) && state === 'unlink') {
			PolicyRemove.process(this._vorpal, match[2]);
		} else if((match = path.match(/(apiproxy\/policies\/)(.*).xml/)) && state === 'change') {
			PolicyChange.process(this._vorpal, match[2]);
		} else if((match = path.match(/(apiproxy\/proxies\/)(.*).xml/)) && state === 'add') {
			ProxyEndpointAdd.process(this._vorpal, match[2]);
		} else if((match = path.match(/(apiproxy\/proxies\/)(.*).xml/)) && state === 'unlink') {
			ProxyEndpointRemove.process(this._vorpal, match[2]);
		} else if((match = path.match(/(apiproxy\/proxies\/)(.*).xml/)) && state === 'change') {
			ProxyEndpointChange.process(this._vorpal, match[2]);
		} else if((match = path.match(/(apiproxy\/targets\/)(.*).xml/)) && state === 'add') {
			TargetEndpointAdd.process(this._vorpal, match[2]);
		} else if((match = path.match(/(apiproxy\/targets\/)(.*).xml/)) && state === 'unlink') {
			TargetEndpointRemove.process(this._vorpal, match[2]);
		} else if((match = path.match(/(apiproxy\/targets\/)(.*).xml/)) && state === 'change') {
			TargetEndpointChange.process(this._vorpal, match[2]);
		}
	}
}

module.exports = Watcher;