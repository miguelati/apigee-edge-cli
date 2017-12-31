const APIProxy = require("../helpers/APIProxy");

class Prompt {
	constructor(vorpal) {
		this._vorpal = vorpal;
		this._asks = [];
	}

	selectProxyEndpoint() {
		this._ask.push({type: 'list', name: 'proxyEndpoint', choices: APIProxy.getProxyEndpoints()});
	}

	selectTargetEndpoint() {
		this._ask.push({type: 'list', name: 'targetEndpoint', choices: APIProxy.getTargetEndpoints()});	
	}

	selectPolicy() {
		this._ask.push({type: 'list', name: 'policy', choices: APIProxy.getPolicies()});	
	}

}

module.exports = Prompt;