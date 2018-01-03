const APIProxyHelper = require('../../helpers/APIProxy');
const ProxyEndpointHelper = require('../../helpers/ProxyEndpoint');
const TargetEndpointHelper = require('../../helpers/TargetEndpoint');

class PolicyRemove {
	constructor(vorpal, policyName) {
		this._vorpal = vorpal;
		this._policyName = policyName;
	}

	static process(vorpal, policyName) {
		let me = new PolicyRemove(vorpal, policyName);
		me.start();
	}

	start() {
		global.watcher.unwatch('./apiproxy/');
		APIProxyHelper.removePolicy(this._policyName);
		this.removeFromProxyEndpoints();
		this.removeFromTargetEndpoins();
		this._vorpal.ui.imprint();
		global.output.success(`${this._policyName} policy was removed!`);
		global.watcher.add('./apiproxy/');
	}

	removeFromProxyEndpoints() {
		let proxyEndpoints = APIProxyHelper.getProxyEndpoints();

		for(let index in proxyEndpoints) {
			let proxyEndpointHelper = new ProxyEndpointHelper(proxyEndpoints[index]);
			proxyEndpointHelper.removeAllStepsByName(this._policyName);
		}
	}

	removeFromTargetEndpoins() {
		let targetEndpoints = APIProxyHelper.getTargetEndpoints();
		for(let index in targetEndpoints) {
			let targetEndpointHelper = new TargetEndpointHelper(targetEndpoints[index]);
			targetEndpointHelper.removeAllStepsByName(this._policyName);
		}
	}
}

module.exports = PolicyRemove;