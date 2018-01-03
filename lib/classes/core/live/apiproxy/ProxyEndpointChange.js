const fs = require("fs-plus");
const APIProxyHelper = require('../../helpers/APIProxy');
const ProxyEndpointHelper = require('../../helpers/ProxyEndpoint');

class ProxyEndpointChange {
	static process(vorpal, proxyEndpointName) {
		let me = new ProxyEndpointChange(vorpal, proxyEndpointName);
		me.start();
	}

	constructor(vorpal, proxyEndpointName) {
		this._vorpal = vorpal;
		this._proxyEndpointName = proxyEndpointName;
	}

	start() {
		let proxyEndpointHelper = new ProxyEndpointHelper(this._proxyEndpointName);
		let newProxyEndpointName = proxyEndpointHelper.getName();
		if(newProxyEndpointName != this._proxyEndpointName) {
			global.watcher.unwatch('./apiproxy/');
			
			proxyEndpointHelper.setName(newProxyEndpointName);
			fs.removeSync(`./apiproxy/proxies/${this._proxyEndpointName}.xml`);
			APIProxyHelper.renameProxyEndpoint(this._proxyEndpointName, newProxyEndpointName);
			this._vorpal.ui.imprint();
			global.output.success(`${this._proxyEndpointName} TargetEndpoint was renamed to ${newProxyEndpointName}!`);
			
			global.watcher.add('./apiproxy/');
		}
	}
}

module.exports = ProxyEndpointChange;