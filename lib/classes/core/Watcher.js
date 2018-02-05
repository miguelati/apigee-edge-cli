const chokidar = require('chokidar');
//const sane = require('sane');
const fs = require("fs-plus");
const rimraf = require("rimraf");
const fromXML = require("from-xml").fromXML;
const toXML = require("to-xml").toXML;
const FlowInProxyEndpointEdit = require("./live/custom/FlowInProxyEndpointEdit");
const FlowInProxyEndpointCreate = require("./live/custom/FlowInProxyEndpointCreate");
const PolicyLive = require("./live/apiproxy/Policy");
const ProxyEndpointLive = require("./live/apiproxy/ProxyEndpoint");
const TargetEndpointLive = require("./live/apiproxy/TargetEndpoint");
const ResourceLive = require("./live/apiproxy/Resource");
const _ = require('lodash')

class Watcher {

	constructor(vorpal) {
		this._vorpal = vorpal;
		this._toMonitor = {
			tmpWatcher: {
				path: "./.tmpWatcher/",
				options: {ignoreInitial: true, persistent: true},
				watcher: null
			},
			apiproxy: {
				path: "",
				options: {ignoreInitial: true, persistent: true},
				watcher: null
			}
		};
		
		if(_.has(global.prefs, 'live.validation') && global.prefs.live.validation && fs.existsSync(`./${global.actualRevision}/apiproxy/`)) 
			this._toMonitor.apiproxy.path = `./${global.actualRevision}/apiproxy/`;

		this.start();
	}

	start() {
		this.stop();
		this.createTmpFolder();
		this.watcherInit();
	}

	unwatch(key) {
		if(this._toMonitor[key].watcher !== null) {
			this._toMonitor[key].watcher.close();
			this._toMonitor[key].watcher = null;
			if(key === "tmpWatcher") rimraf.sync(this._toMonitor[key].path);
		}
	}

	add(key, path = "") {
		if(path !== "") this._toMonitor[key].path = path;
		if(this._toMonitor[key].watcher === null && this._toMonitor[key].path !== "") {
			this._toMonitor[key].watcher = chokidar.watch(this._toMonitor[key].path, this._toMonitor[key].options)
			.on('add', path => this.processFile(path, 'add'))
  			.on('change', path => this.processFile(path, 'change'))
  			.on('unlink', path => this.processFile(path, 'unlink'));
		}
	}

	stop() {
		for(let key in this._toMonitor) this.unwatch(key);
	}

	createTmpFolder() {
		if(fs.existsSync(this._toMonitor.tmpWatcher.path)) rimraf.sync(this._toMonitor.tmpWatcher.path);
		fs.makeTreeSync(this._toMonitor.tmpWatcher.path);
	}

	watcherInit() {
		for(let key in this._toMonitor) this.add(key);
	}

	processFile(path, state) {
		let match = null;
		
		if((match = path.match(/(\.tmpWatcher\/)edit_proxyEndpoint_(\w+)_flow_(.*).xml/)) && state === 'change') {
			FlowInProxyEndpointEdit.process(this._vorpal, match[3], match[2], fs.readFileSync(path, 'utf8'));
		} else if((match = path.match(/(\.tmpWatcher\/)create_proxyEndpoint_(\w+)_flow_(.*)_index_(\d+).xml/)) && state === 'change') {
			FlowInProxyEndpointCreate.process(this._vorpal, match[3], match[2], match[4], fs.readFileSync(path, 'utf8'));
		} else if((match = path.match(/(apiproxy\/policies\/)(.*).xml/))) {
			PolicyLive.process(this._vorpal, match[2], state);
		} else if((match = path.match(/(apiproxy\/proxies\/)(.*).xml/))) {
			ProxyEndpointLive.process(this._vorpal, match[2], state);
		} else if((match = path.match(/(apiproxy\/targets\/)(.*).xml/))) {
			TargetEndpointLive.process(this._vorpal, match[2], state);
		} else if((match = path.match(/(apiproxy\/resources\/)(\w*)\/(.*)/))) {
			ResourceLive.process(this._vorpal, match[2], match[3], state);
		}
	}
}

module.exports = Watcher;