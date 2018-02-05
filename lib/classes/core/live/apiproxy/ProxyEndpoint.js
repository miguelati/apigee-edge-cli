const fs = require("fs-plus");
const APIProxyHelper = require('../../helpers/APIProxy');
const ProxyEndpointHelper = require('../../helpers/ProxyEndpoint');
const _ = require("lodash");

class ProxyEndpoint {
	static process(vorpal, proxyEndpointName, state) {
		let me = new ProxyEndpoint(vorpal, proxyEndpointName);
		if(_.hasIn(me, state)) me[state]();
	}

	constructor(vorpal, proxyEndpointName) {
		this._vorpal = vorpal;
		this._proxyEndpointName = proxyEndpointName;
	}

	add() {
		global.watcher.unwatch('apiproxy');
		APIProxyHelper.addProxyEndpoint(this._proxyEndpointName);
		this._vorpal.ui.imprint();
		global.output.success(`${this._proxyEndpointName} ProxyEndpoint was added!`);
		global.watcher.add('apiproxy',`./${global.actualRevision}/apiproxy/`);
	}

	change() {
		let proxyEndpointHelper = new ProxyEndpointHelper(this._proxyEndpointName);
		let newProxyEndpointName = proxyEndpointHelper.getName();
		if(newProxyEndpointName != this._proxyEndpointName) {
			global.watcher.unwatch('apiproxy');
			
			proxyEndpointHelper.setName(newProxyEndpointName);
			fs.removeSync(`./${global.actualRevision}/apiproxy/proxies/${this._proxyEndpointName}.xml`);
			APIProxyHelper.renameProxyEndpoint(this._proxyEndpointName, newProxyEndpointName);
			this._vorpal.ui.imprint();
			global.output.success(`${this._proxyEndpointName} TargetEndpoint was renamed to ${newProxyEndpointName}!`);
			
			global.watcher.add('apiproxy',`./${global.actualRevision}/apiproxy/`);
		}
	}

	unlink() {
		global.watcher.unwatch('apiproxy');
		APIProxyHelper.removeProxyEndpoint(this._proxyEndpointName);
		this._vorpal.ui.imprint();
		global.output.success(`${this._proxyEndpointName} ProxyEndpoint was removed!`);
		global.watcher.add('apiproxy',`./${global.actualRevision}/apiproxy/`);
	}
}

module.exports = ProxyEndpoint;