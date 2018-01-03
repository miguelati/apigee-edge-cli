const APIProxyHelper = require('../../helpers/APIProxy');
const TargetEndpointHelper = require('../../helpers/TargetEndpoint');

class TargetEndpointAdd {
	constructor(vorpal, targetEndpointName) {
		this._vorpal = vorpal;
		this._targetEndpointName = targetEndpointName;
	}

	static process(vorpal, targetEndpointName) {
		let me = new TargetEndpointAdd(vorpal, targetEndpointName);
		me.start();
	}

	start() {
		global.watcher.unwatch('./apiproxy/');
		APIProxyHelper.addProxyEndpoint(this._targetEndpointName);
		this._vorpal.ui.imprint();
		global.output.success(`${this._targetEndpointName} ProxyEndpoint was added!`);
		global.watcher.add('./apiproxy/');
	}
}

module.exports = TargetEndpointAdd;