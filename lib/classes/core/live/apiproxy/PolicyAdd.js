const APIProxyHelper = require('../../helpers/APIProxy');
const ProxyEndpointHelper = require('../../helpers/ProxyEndpoint');
const TargetEndpointHelper = require('../../helpers/TargetEndpoint');

class PolicyAdd {
	constructor(vorpal, policyName) {
		this._vorpal = vorpal;
		this._policyName = policyName;
	}

	static process(vorpal, policyName) {
		let me = new PolicyAdd(vorpal, policyName);
		me.start();
	}

	start() {
		global.watcher.unwatch('./apiproxy/');
		APIProxyHelper.addPolicy(this._policyName);
		
		this._vorpal.ui.imprint();
		global.output.success(`${this._policyName} policy was added!`);
		global.watcher.add('./apiproxy/');
	}
}

module.exports = PolicyAdd;