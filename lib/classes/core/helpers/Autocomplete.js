const Command = require("../Command");
const _ = require("lodash");
const APIProxyHelper = require("./APIProxy");
const ProxyEndpointHelper = require("./ProxyEndpoint");

class Autocomplete {
	static getProxyEndpoints() {
		return () => APIProxyHelper.getProxyEndpoints();
	}

	static getTargetEndpoints() {
		return () => APIProxyHelper.getTargetEndpoints();
	}

	static getPolicies() {
		return () => APIProxyHelper.getPolicies();
	}

	static getResources() {
		return () => APIProxyHelper.getResources();
	}

	static getFlowsByProxyEndpoint(vorpal) {
		return {data: (input, callback) => {
			let UIInput = vorpal.ui.input();
			if(UIInput.match(/(\-p |\-\-proxyEndpoint ) (\-\-request)? ([0-9A-Za-z]+) /g) === null) {
				console.log("ASf");
				callback([]);
			} else {
				let match = UIInput.match(/^(.+) --proxyEndpoint (\w+) (\w*)/);
				if(input.indexOf(" ") === -1) {
					let proxyEndpoint = new ProxyEndpointHelper(match[2]);
					let autocomplete = proxyEndpoint.getFlowsNames();
					let result = autocomplete.map((item) => (item.indexOf(" ") === -1) ? item : `"${item}"`);
					if(!_.isUndefined(match[3]) && result.indexOf(match[3]) > -1) {
						console.log("poi")
						callback([]);
					} else {
						console.log("sdf")
						callback(result);
					}
				} else {
					console.log("fdfg")
					callback([]);
				}
			}
		}};
	}
}

module.exports = Autocomplete;