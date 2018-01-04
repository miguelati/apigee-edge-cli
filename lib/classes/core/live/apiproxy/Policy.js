const fs = require("fs-plus");
const APIProxyHelper = require('../../helpers/APIProxy');
const ProxyEndpointHelper = require('../../helpers/ProxyEndpoint');
const TargetEndpointHelper = require('../../helpers/TargetEndpoint');
const PolicyHelper = require('../../helpers/Policy');
const _ = require("lodash");

class Policy {
	static process(vorpal, policyName, state) {
		let me = new Policy(vorpal, policyName);
		if(_.hasIn(me, state)) me[state]();
	}

	constructor(vorpal, policyName) {
		this._vorpal = vorpal;
		this._policyName = policyName;
	}

	add() {
		global.watcher.unwatch('./apiproxy/');
		APIProxyHelper.addPolicy(this._policyName);
		
		this._vorpal.ui.imprint();
		global.output.success(`${this._policyName} policy was added!`);
		global.watcher.add('./apiproxy/');
	}

	change() {
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

	unlink() {
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

module.exports = Policy;