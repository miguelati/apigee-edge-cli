const fs = require("fs-plus");
const fromXML = require("from-xml").fromXML;
const toXML = require("to-xml").toXML;
const _ = require("lodash");
const dotty = require("dotty");

class ProxyEndpoint {
	constructor(proxyEndpointName) {
		this._name = proxyEndpointName;
		this._json = this.openProxyEndpointXML();
	}

	getName() {
		return this._json.ProxyEndpoint["@name"];
	}

	setName(proxyEndpointNewName) {
		this._name = proxyEndpointNewName;
		this._json.ProxyEndpoint["@name"] = proxyEndpointNewName;
		this.save();
	}

	save() {
		let xml = toXML(this._json, null, 2);
		fs.writeFileSync(`./apiproxy/proxies/${this._name}.xml`, xml, { encoding: 'utf8'});
	}

	getStepNames(path) {
		if(dotty.exists(this._json, path)) {
			let found = dotty.get(this._json, path);
			if(_.isArray(found)) {
				return found.map((item) => item.Name);
			} else if(_.isObject(found)) {
				return [found.Name];
			} else {
				return [found];
			}
		} else {
			return [];
		}
	}

	getStepNamesFromObj(obj, path) {
		if(dotty.exists(obj, path)) {
			let found = dotty.get(obj, path);
			if(_.isArray(found)) {
				return found.map((item) => item.Name);
			} else if(_.isObject(found)) {
				return [found.Name];
			} else {
				return [found];
			}
		} else {
			return [];
		}
	}

	getFlowStepNamesByName(flowName, type) {
		if(dotty.exists(this._json, 'ProxyEndpoint.Flows.Flow')) {
			let flowsFound = dotty.get(this._json, 'ProxyEndpoint.Flows.Flow');
			if(_.isArray(flowsFound)) {
				let flowFound = null;
				for(let index in flowsFound) {
					if(flowsFound[index]["@name"] === flowName) {
						flowFound = this.getStepNamesFromObj(flowsFound[index], `${type}.Step`);
					}
				}
				return (flowFound === null) ? [] : flowFound;
			} else if(_.isObject(found)) {
				let flowFound = null;
				if(flowsFound["@name"] === flowName) {
					flowFound = this.getStepNamesFromObj(flowsFound[index], `${type}.Step`);
				}
				return (flowFound === null) ? [] : flowFound;
			} else {
				return [];
			}
		} else {
			return [];
		}
	}

	checkFlowsNames(path, flowName) {
		if(dotty.exists(this._json, path)) {
			let found = dotty.get(this._json, path);
			if(_.isArray(found)) {
				return found.map((item) => item['@name']);
			} else if(_.isObject(found)) {
				return [found.Name];
			} else {
				return [found];
			}
		} else {
			return [];
		}
	}

	openProxyEndpointXML() {
		let content = fs.readFileSync(`./apiproxy/proxies/${this._name}.xml`, 'utf8');
		return fromXML(content);
	}

	getFaultRulesNames() {
		return this.getStepNames('ProxyEndpoint.FaultRules.FaultRule.Step');
	}

	getPreFlowRequestStepNames() {
		return this.getStepNames('ProxyEndpoint.PreFlow.Request.Step');
	}

	getPreFlowResponseStepNames() {
		return this.getStepNames('ProxyEndpoint.PreFlow.Response.Step');
	}

	getPostFlowRequestStepNames() {
		return this.getStepNames('ProxyEndpoint.PostFlow.Request.Step');
	}

	getPostFlowResponseStepNames() {
		return this.getStepNames('ProxyEndpoint.PostFlow.Response.Step');
	}

	getFlowsNames() {
		return this.checkFlowsNames('ProxyEndpoint.Flows.Flow');
	}

	getFlowRequestStepNames(flowName) {
		return this.getFlowStepNamesByName(flowName, 'Request');
	}

	getFlowResponseStepNames(flowName) {
		return this.getFlowStepNamesByName(flowName, 'Response');
	}

	removeStepByName(obj, path, name) {
		if(dotty.exists(obj, path)) {
			let step = dotty.get(obj, path);
			if(_.isArray(step)) {
				_.remove(step, (item) => item.Name == name);
				return step;
			} else if (_.isObject(step)) {
				return (step.Name === name) ? null : step;
			}	
		}
	}

	removeAllStepsByName(policyName) {

		let allPaths = [
			'ProxyEndpoint.FaultRules.FaultRule.Step',
			'ProxyEndpoint.PreFlow.Request.Step',
			'ProxyEndpoint.PreFlow.Response.Step',
			'ProxyEndpoint.PostFlow.Request.Step',
			'ProxyEndpoint.PostFlow.Response.Step'
		];

		for(let index in allPaths) {
			dotty.put(this._json, allPaths[index], this.removeStepByName(this._json, allPaths[index], policyName));
		}

		// remove All Flows
		if(dotty.exists(this._json, 'ProxyEndpoint.Flows.Flow')) {
			let flowsFound = dotty.get(this._json, 'ProxyEndpoint.Flows.Flow');
			if(_.isArray(flowsFound)) {
				for(let index in flowsFound) {
					dotty.put(flowsFound[index], 'Request.Step', this.removeStepByName(flowsFound[index], 'Request.Step', policyName));
					dotty.put(flowsFound[index], 'Response.Step', this.removeStepByName(flowsFound[index], 'Response.Step', policyName));
				}
				
			} else if(_.isObject(flowsFound)) {
				dotty.put(flowsFound, 'Request.Step', this.removeStepByName(flowsFound, 'Request.Step', policyName));
				dotty.put(flowsFound, 'Response.Step', this.removeStepByName(flowsFound, 'Response.Step', policyName));
			}

			dotty.put(this._json, 'ProxyEndpoint.Flows.Flow', flowsFound);
		}

		this.save();
	}

	renameStepByName(obj, path, oldName, newName) {
		if(dotty.exists(obj, path)) {
			let step = dotty.get(obj, path);
			if(_.isArray(step)) {
				let stepIndex = _.findIndex(step, (item) =>  item.Name == oldName);
				if(stepIndex !== -1) {
					step[stepIndex].Name = newName;	
				}
				return step;
			} else if (_.isObject(step)) {
				if (step.Name === oldName) step.Name = newName;
				return step;
			}	
		}
	}

	renameAllStepsByName(policyOldName, policyNewName) {

		let allPaths = [
			'ProxyEndpoint.FaultRules.FaultRule.Step',
			'ProxyEndpoint.PreFlow.Request.Step',
			'ProxyEndpoint.PreFlow.Response.Step',
			'ProxyEndpoint.PostFlow.Request.Step',
			'ProxyEndpoint.PostFlow.Response.Step'
		];

		for(let index in allPaths) {
			dotty.put(this._json, allPaths[index], this.renameStepByName(this._json, allPaths[index], policyOldName, policyNewName));
		}

		// remove All Flows
		if(dotty.exists(this._json, 'ProxyEndpoint.Flows.Flow')) {
			let flowsFound = dotty.get(this._json, 'ProxyEndpoint.Flows.Flow');
			if(_.isArray(flowsFound)) {
				for(let index in flowsFound) {
					dotty.put(flowsFound[index], 'Request.Step', this.renameStepByName(flowsFound[index], 'Request.Step', policyOldName, policyNewName));
					dotty.put(flowsFound[index], 'Response.Step', this.renameStepByName(flowsFound[index], 'Response.Step', policyOldName, policyNewName));
				}
				
			} else if(_.isObject(flowsFound)) {
				dotty.put(flowsFound, 'Request.Step', this.renameStepByName(flowsFound, 'Request.Step', policyOldName, policyNewName));
				dotty.put(flowsFound, 'Response.Step', this.renameStepByName(flowsFound, 'Response.Step', policyOldName, policyNewName));
			}

			dotty.put(this._json, 'ProxyEndpoint.Flows.Flow', flowsFound);
		}

		this.save();
	}
}

module.exports = ProxyEndpoint;