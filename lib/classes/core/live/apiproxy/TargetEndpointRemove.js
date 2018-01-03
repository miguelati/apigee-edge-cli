const APIProxyHelper = require('../../helpers/APIProxy');
const TargetEndpointHelper = require('../../helpers/TargetEndpoint');

class TargetEndpointRemove {
	constructor(vorpal, targetEndpointName) {
		this._vorpal = vorpal;
		this._targetEndpointName = targetEndpointName;
	}

	static process(vorpal, targetEndpointName) {
		let me = new TargetEndpointRemove(vorpal, targetEndpointName);
		me.start();
	}

	start() {
		global.watcher.unwatch('./apiproxy/');
		APIProxyHelper.removeProxyEndpoint(this._targetEndpointName);
		this._vorpal.ui.imprint();
		global.output.success(`${this._targetEndpointName} ProxyEndpoint was removed!`);
		global.watcher.add('./apiproxy/');
	}
}

module.exports = TargetEndpointRemove;