const chokidar = require('chokidar');
const fs = require("fs-plus");
const rimraf = require("rimraf");
const fromXML = require("from-xml").fromXML;
const toXML = require("to-xml").toXML;
const FlowInProxyEndpoint = require("./live/custom/FlowInProxyEndpoint");
const RemovePolicy = require("./live/apiproxy/RemovePolicy");

class Watcher {

	constructor(path, vorpal) {
		this._path = path;
		this._vorpal = vorpal;
	}

	start(states) {
		this.createTmpFolder();
		this.watcherInit();
	}

	stop() {
		if(fs.existsSync(this._path[0])) {
			this._watcher.unwatch(this._path[0]);
			rimraf.sync(this._path[0]);
		}
	}

	createTmpFolder() {
		if(fs.existsSync(this._path[0])) {
			rimraf.sync(this._path[0]);		
		}
		fs.makeTreeSync(this._path[0]);
	}

	watcherInit() {
		this._watcher = chokidar.watch(this._path, {
		  persistent: true,
		  ignoreInitial: true
		})
		.on('change', path => {
			this.processFile(path, 'change');
		})
		.on('add', path => {
			this.processFile(path, 'add');
		})
		.on('unlink', path => {
			this.processFile(path, 'unlink');
		});
	}

	processFile(path, state) {
		let match = null;
		if((match = path.match(/(\.tmpWatcher\/)proxyEndpoint_(\w+)_flow_(.*).xml/)) && state === 'change') {
			FlowInProxyEndpoint.process(this._vorpal, match[3], match[2], fs.readFileSync(path, 'utf8'));
		} else if((match = path.match(/(apiproxy\/policies\/)(.*).xml/)) && state === 'unlink') {
			RemovePolicy.process(this._vorpal, match[2]);
		}
	}
}

module.exports = Watcher;