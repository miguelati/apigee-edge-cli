const APIProxyHelper = require('../../helpers/APIProxy');
const ProxyEndpointHelper = require('../../helpers/ProxyEndpoint');

class ProxyEndpointRemove {
	constructor(vorpal, proxyEndpointName) {
		this._vorpal = vorpal;
		this._proxyEndpointName = proxyEndpointName;
	}

	static process(vorpal, proxyEndpointName) {
		let me = new ProxyEndpointRemove(vorpal, proxyEndpointName);
		me.start();
	}

	start() {
		global.watcher.unwatch('./apiproxy/');
		APIProxyHelper.removeProxyEndpoint(this._proxyEndpointName);
		this._vorpal.ui.imprint();
		global.output.success(`${this._proxyEndpointName} ProxyEndpoint was removed!`);
		global.watcher.add('./apiproxy/');
	}
}

module.exports = ProxyEndpointRemove;