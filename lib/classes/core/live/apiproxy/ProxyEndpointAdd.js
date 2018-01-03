const APIProxyHelper = require('../../helpers/APIProxy');
const ProxyEndpointHelper = require('../../helpers/ProxyEndpoint');

class ProxyEndpointAdd {
	constructor(vorpal, proxyEndpointName) {
		this._vorpal = vorpal;
		this._proxyEndpointName = proxyEndpointName;
	}

	static process(vorpal, proxyEndpointName) {
		let me = new ProxyEndpointAdd(vorpal, proxyEndpointName);
		me.start();
	}

	start() {
		global.watcher.unwatch('./apiproxy/');
		APIProxyHelper.addProxyEndpoint(this._proxyEndpointName);
		this._vorpal.ui.imprint();
		global.output.success(`${this._proxyEndpointName} ProxyEndpoint was added!`);
		global.watcher.add('./apiproxy/');
	}
}

module.exports = ProxyEndpointAdd;