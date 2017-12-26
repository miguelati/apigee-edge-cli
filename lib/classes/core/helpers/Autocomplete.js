const Command = require("../Command");
const _ = require("lodash");

class Autocomplete {
	static getProxyEndpoints() {
		let autocomplete = Command.getObject(global.localStorage.getItem('apiproxy.proxyEndpoints'));
		let result = Command.verifyArray(autocomplete);
		return result.map((item) => (item.indexOf(" ") === -1) ? item : `"${item}"`);
	}

	static getTargetEndpoints() {
		let autocomplete = Command.getObject(global.localStorage.getItem('apiproxy.targetEndpoints'));
		let result = Command.verifyArray(autocomplete);
		return result.map((item) => (item.indexOf(" ") === -1) ? item : `"${item}"`);
	}

	static getPolicies() {
		let autocomplete = Command.getObject(global.localStorage.getItem('apiproxy.policies'));
		return Command.verifyArray(autocomplete);
	}

	static getFlowsByProxyEndpoint(vorpalInput, input, callback) {
		if(vorpalInput.match(/(\-p |\-\-proxyEndpoint )([0-9A-Za-z]+) /g) === null) {
			callback([]);
		} else {
			let match = vorpalInput.match(/^(.+) --proxyEndpoint (\w+) (\w*)/);
			if(input.indexOf(" ") === -1) {
				let autocomplete = Command.getObject(global.localStorage.getItem(`proxy.${match[2]}.flows.nameFlows`));
				let tmpResult = Command.verifyArray(autocomplete);
				let result = tmpResult.map((item) => (item.indexOf(" ") === -1) ? item : `"${item}"`);
				if(!_.isUndefined(match[3]) && result.indexOf(match[3]) > -1) {
					callback([]);
				} else {
					callback(result);
				}
			} else {
				callback([]);
			}
		}
	}
}

module.exports = Autocomplete;