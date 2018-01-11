const fs = require("fs-plus");
const APIProxyHelper = require('../../helpers/APIProxy');
const ProxyEndpointHelper = require('../../helpers/ProxyEndpoint');
const TargetEndpointHelper = require('../../helpers/TargetEndpoint');
const PolicyHelper = require('../../helpers/Policy');
const _ = require("lodash");
const ApiProxyRest = require('../../../apigee/ApiProxyRest');

class Policy {
	static process(vorpal, policyName, state) {
		let me = new Policy(vorpal, policyName);
		if(_.hasIn(me, state)) me[state]();
	}

	constructor(vorpal, policyName) {
		this._vorpal = vorpal;
		this._policyName = policyName;
		this._policyNameWithColor = global.chalk.yellow(this._policyName);
	}

	add() {
		global.watcher.unwatch(`./${global.actualRevision}/apiproxy/`);
		APIProxyHelper.addPolicy(this._policyName);
		
		this._vorpal.ui.imprint();
		global.output.success(`${this._policyNameWithColor} policy was added!`);
		this.liveUpload("create")
		global.watcher.add(`./${global.actualRevision}/apiproxy/`);
	}

	change() {
		let policyHelper = new PolicyHelper(this._policyName);
		let newPolicyName = policyHelper.getName();
		global.watcher.unwatch(`./${global.actualRevision}/apiproxy/`);
		if(newPolicyName != this._policyName) {
			
			policyHelper.setName(newPolicyName);

			fs.removeSync(`./${global.actualRevision}/apiproxy/policies/${this._policyName}.xml`);
			
			APIProxyHelper.renamePolicy(this._policyName, newPolicyName);
			let proxyEndpointsChangeds = this.renameFromProxyEndpoints(newPolicyName);
			let targetEndpointsChangeds = this.renameFromTargetEndpoins(newPolicyName);

			this._vorpal.ui.imprint();
			global.output.success(`${this._policyNameWithColor} policy was renamed to ${newPolicyName}!`);
			if(global.prefs.live.upload) this.liveUpload("create");
			//TODO: upload proxiesEndpoins modified if is posible.
		} else if (global.prefs.live.upload) {
			this.liveUpload("update");
		}
		global.watcher.add(`./${global.actualRevision}/apiproxy/`);	
	}

	unlink() {
		global.watcher.unwatch(`./${global.actualRevision}/apiproxy/`);
		APIProxyHelper.removePolicy(this._policyName);
		this.removeFromProxyEndpoints();
		this.removeFromTargetEndpoins();
		this._vorpal.ui.imprint();
		global.output.success(`${this._policyNameWithColor} policy was removed!`);
		global.watcher.add(`./${global.actualRevision}/apiproxy/`);
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
		let changeds = [];

		for(let index in proxyEndpoints) {
			let proxyEndpointHelper = new ProxyEndpointHelper(proxyEndpoints[index]);
			proxyEndpointHelper.renameAllStepsByName(this._policyName, policyNewName);
			if(proxyEndpointHelper.wasChanged) changeds.push(proxyEndpoints[index]);
		}

		return changeds;
	}

	renameFromTargetEndpoins(policyNewName) {
		let targetEndpoints = APIProxyHelper.getTargetEndpoints();
		let changeds = [];

		for(let index in targetEndpoints) {
			let targetEndpointHelper = new TargetEndpointHelper(targetEndpoints[index]);
			targetEndpointHelper.renameAllStepsByName(this._policyName, policyNewName);
			if(targetEndpointHelper.wasChanged) changeds.push(targetEndpoints[index]);
		}

		return changeds;
	}

	async liveUpload(type) {
		try {
			let body = fs.readFileSync(`./${global.actualRevision}/apiproxy/policies/${this._policyName}.xml`, 'utf8');
			let info = APIProxyHelper.getInfo();
			let response = await ApiProxyRest[`${type}Policy`]({name: info.name, revision: info.revision, body: body, policyName: this._policyName}, global.prefs.apigee);
			this._vorpal.ui.imprint();
			let apiProxyNameWithColor = global.chalk.yellow(info.name); 
			global.output.success(`Policy ${this._policyNameWithColor} was ${type}d in APIProxy ${apiProxyNameWithColor}`);
		} catch(e) {
			this._vorpal.ui.imprint();
			global.output.error(e);
		}
	}
}

module.exports = Policy;