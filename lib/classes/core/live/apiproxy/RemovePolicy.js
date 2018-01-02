const fs = require("fs-plus");
const rimraf = require("rimraf");
const fromXML = require("from-xml").fromXML;
const toXML = require("to-xml").toXML;
const APIProxyHelper = require('../../helpers/APIProxy');
const ProxyEndpointHelper = require('../../helpers/ProxyEndpoint');
const TargetEndpointHelper = require('../../helpers/TargetEndpoint');

class RemovePolicy {
	constructor(vorpal, policyName) {
		this._vorpal = vorpal;
		this._policyName = policyName;
	}

	static process(vorpal, policyName) {
		let me = new RemovePolicy(vorpal, policyName);
		me.start();
	}

	start() {
		APIProxyHelper.removePolicy(this._policyName);
		this.removeFromProxyEndpoints();
		this.removeFromTargetEndpoins();
		this._vorpal.ui.imprint();
		global.output.success(`${this._policyName} policy was removed!`);
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

module.exports = RemovePolicy;