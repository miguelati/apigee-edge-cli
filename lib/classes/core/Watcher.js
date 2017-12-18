const chokidar = require('chokidar');
const fs = require("fs-plus");
const rimraf = require("rimraf");

class Watcher {

	constructor(path) {
		this._path = path;
	}

	start() {
		this.createTmpFolder();
		this.watcherInit();
	}

	stop() {
		this._watcher.unwatch(this._path);
		rimraf.sync(this._path);
	}

	createTmpFolder() {
		if(!fs.existsSync(this._path)) {
			fs.makeTreeSync(this._path);
		}
	}

	watcherInit() {
		this._watcher = chokidar.watch(this._path, {
		  persistent: true
		})
		.on('add', this.processAddFile);
	}

	processAddFile(path, stats) {
		//console.log(path);
		//console.log(stats);
	}
}

module.exports = Watcher;