const fs = require("fs-plus");
const APIProxyHelper = require('../../helpers/APIProxy');
const ProxyEndpointHelper = require('../../helpers/ProxyEndpoint');
const TargetEndpointHelper = require('../../helpers/TargetEndpoint');
const PolicyHelper = require('../../helpers/Policy');

class PolicyChange {
	static process(vorpal, policyName) {
		let me = new PolicyChange(vorpal, policyName);
		me.start();
	}

	constructor(vorpal, policyName) {
		this._vorpal = vorpal;
		this._policyName = policyName;
	}

	start() {
		let policyHelper = new PolicyHelper(this._policyName);
		let newPolicyName = policyHelper.getName();
		if(newPolicyName != this._policyName) {
			global.watcher.unwatch('./apiproxy/');
			policyHelper.setName(newPolicyName);

			fs.removeSync(`./apiproxy/policies/${this._policyName}.xml`);
			
			APIProxyHelper.renamePolicy(this._policyName, newPolicyName);
			this.renameFromProxyEndpoints(newPolicyName);
			this.renameFromTargetEndpoins(newPolicyName);

			this._vorpal.ui.imprint();
			global.output.success(`${this._policyName} policy was renamed to ${newPolicyName}!`);
			global.watcher.add('./apiproxy/');
		}
	}

	renameFromProxyEndpoints(policyNewName) {
		let proxyEndpoints = APIProxyHelper.getProxyEndpoints();

		for(let index in proxyEndpoints) {
			let proxyEndpointHelper = new ProxyEndpointHelper(proxyEndpoints[index]);
			proxyEndpointHelper.renameAllStepsByName(this._policyName, policyNewName);
		}
	}

	renameFromTargetEndpoins(policyNewName) {
		let targetEndpoints = APIProxyHelper.getTargetEndpoints();
		for(let index in targetEndpoints) {
			let targetEndpointHelper = new TargetEndpointHelper(targetEndpoints[index]);
			targetEndpointHelper.renameAllStepsByName(this._policyName, policyNewName);
		}
	}
}

module.exports = PolicyChange;