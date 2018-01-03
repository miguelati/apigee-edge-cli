const fs = require("fs-plus");
const APIProxyHelper = require('../../helpers/APIProxy');
const TargetEndpointHelper = require('../../helpers/TargetEndpoint');

class TargetEndpointChange {
	static process(vorpal, targetEndpointName) {
		let me = new TargetEndpointChange(vorpal, targetEndpointName);
		me.start();
	}

	constructor(vorpal, targetEndpointName) {
		this._vorpal = vorpal;
		this._targetEndpointName = targetEndpointName;
	}

	start() {
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
}

module.exports = TargetEndpointChange;