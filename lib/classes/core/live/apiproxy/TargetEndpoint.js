const fs = require("fs-plus");
const APIProxyHelper = require('../../helpers/APIProxy');
const TargetEndpointHelper = require('../../helpers/TargetEndpoint');
const _ = require("lodash");


class TargetEndpoint {
	static process(vorpal, targetEndpointName, type) {
		let me = new TargetEndpoint(vorpal, targetEndpointName);
		if(type in _.keys(me)) me[type]();
	}

	constructor(vorpal, targetEndpointName) {
		this._vorpal = vorpal;
		this._targetEndpointName = targetEndpointName;
	}

	add() {
		global.watcher.unwatch('./apiproxy/');
		APIProxyHelper.addProxyEndpoint(this._targetEndpointName);
		this._vorpal.ui.imprint();
		global.output.success(`${this._targetEndpointName} ProxyEndpoint was added!`);
		global.watcher.add('./apiproxy/');
	}

	change() {
		let targetEndpointHelper = new TargetEndpointHelper(this._targetEndpointName);
		let newTargetEndpointName = targetEndpointHelper.getName();
		if(newTargetEndpointName != this._targetEndpointName) {
			global.watcher.unwatch('./apiproxy/');
			
			targetEndpointHelper.setName(newTargetEndpointName);
			fs.removeSync(`./apiproxy/targets/${this._targetEndpointName}.xml`);
			APIProxyHelper.renameTargetEndpoint(this._targetEndpointName, newTargetEndpointName);
			this._vorpal.ui.imprint();
			global.output.success(`${this._targetEndpointName} TargetEndpoint was renamed to ${newTargetEndpointName}!`);
			
			global.watcher.add('./apiproxy/');
		}
	}

	unlink() {
		global.watcher.unwatch('./apiproxy/');
		APIProxyHelper.removeProxyEndpoint(this._targetEndpointName);
		this._vorpal.ui.imprint();
		global.output.success(`${this._targetEndpointName} ProxyEndpoint was removed!`);
		global.watcher.add('./apiproxy/');
	}
}

module.exports = TargetEndpoint;