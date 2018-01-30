const fs = require("fs-plus");
const APIProxyHelper = require('../../helpers/APIProxy');
const TargetEndpointHelper = require('../../helpers/TargetEndpoint');
const _ = require("lodash");


class TargetEndpoint {
	static process(vorpal, targetEndpointName, state) {
		let me = new TargetEndpoint(vorpal, targetEndpointName);
		if(_.hasIn(me, state)) me[state]();
	}

	constructor(vorpal, targetEndpointName) {
		this._vorpal = vorpal;
		this._targetEndpointName = targetEndpointName;
	}

	add() {
		global.watcher.unwatch(`./${global.actualRevision}/apiproxy/`);
		APIProxyHelper.addTargetEndpoint(this._targetEndpointName);
		this._vorpal.ui.imprint();
		global.output.success(`${this._targetEndpointName} TargetEndpoint was added!`);
		global.watcher.add(`./${global.actualRevision}/apiproxy/`);
	}

	change() {
		let targetEndpointHelper = new TargetEndpointHelper(this._targetEndpointName);
		let newTargetEndpointName = targetEndpointHelper.getName();
		if(newTargetEndpointName != this._targetEndpointName) {
			global.watcher.unwatch(`./${global.actualRevision}/apiproxy/`);
			
			targetEndpointHelper.setName(newTargetEndpointName);
			fs.removeSync(`./${global.actualRevision}/apiproxy/targets/${this._targetEndpointName}.xml`);
			APIProxyHelper.renameTargetEndpoint(this._targetEndpointName, newTargetEndpointName);
			this._vorpal.ui.imprint();
			global.output.success(`${this._targetEndpointName} TargetEndpoint was renamed to ${newTargetEndpointName}!`);
			
			global.watcher.add(`./${global.actualRevision}/apiproxy/`);
		}
	}

	unlink() {
		global.watcher.unwatch(`./${global.actualRevision}/apiproxy/`);
		APIProxyHelper.removeProxyEndpoint(this._targetEndpointName);
		this._vorpal.ui.imprint();
		global.output.success(`${this._targetEndpointName} ProxyEndpoint was removed!`);
		global.watcher.add(`./${global.actualRevision}/apiproxy/`);
	}
}

module.exports = TargetEndpoint;