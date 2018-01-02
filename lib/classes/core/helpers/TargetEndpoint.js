const fs = require("fs-plus");
const fromXML = require("from-xml").fromXML;
const toXML = require("to-xml").toXML;
const _ = require("lodash");
const dotty = require("dotty");

class TargetEndpoint {
	constructor(targetEndpointName) {
		this._name = targetEndpointName;
		this._json = this.openProxyEndpointXML();
	}

	getName() {
		return this._json.TargetEndpoint["@name"];
	}

	save() {
		let xml = toXML(this._json, null, 2);
		fs.writeFileSync(`./apiproxy/targets/${this._name}.xml`, xml, { encoding: 'utf8'});
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
		if(dotty.exists(this._json, 'TargetEndpoint.Flows.Flow')) {
			let flowsFound = dotty.get(this._json, 'TargetEndpoint.Flows.Flow');
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

	checkFlowsNames(path) {
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
		let content = fs.readFileSync(`./apiproxy/targets/${this._name}.xml`, 'utf8');
		return fromXML(content);
	}

	getFaultRulesNames() {
		return this.getStepNames('TargetEndpoint.FaultRules.FaultRule.Step');
	}

	getPreFlowRequestStepNames() {
		return this.getStepNames('TargetEndpoint.PreFlow.Request.Step');
	}

	getPreFlowResponseStepNames() {
		return this.getStepNames('TargetEndpoint.PreFlow.Response.Step');
	}

	getPostFlowRequestStepNames() {
		return this.getStepNames('TargetEndpoint.PostFlow.Request.Step');
	}

	getPostFlowResponseStepNames() {
		return this.getStepNames('TargetEndpoint.PostFlow.Response.Step');
	}

	getFlowsNames() {
		return this.checkFlowsNames('TargetEndpoint.Flows.Flow');
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
				_.remove(step, (item) => item.Name === name);
				return step;
			} else if (_.isObject(step)) {
				return (step.Name === name) ? null : step;
			}	
		}
	}

	removeAllStepsByName(policyName) {

		let allPaths = [
			'TargetEndpoint.FaultRules.FaultRule.Step',
			'TargetEndpoint.PreFlow.Request.Step',
			'TargetEndpoint.PreFlow.Response.Step',
			'TargetEndpoint.PostFlow.Request.Step',
			'TargetEndpoint.PostFlow.Response.Step'
		];

		for(let index in allPaths) {
			dotty.put(this._json, allPaths[index], this.removeStepByName(this._json, allPaths[index], policyName));
		}

		// remove All Flows
		if(dotty.exists(this._json, 'TargetEndpoint.Flows.Flow')) {
			let flowsFound = dotty.get(this._json, 'TargetEndpoint.Flows.Flow');
			if(_.isArray(flowsFound)) {
				for(let index in flowsFound) {
					dotty.put(flowsFound[index], 'Request.Step', this.removeStepByName(flowsFound[index], 'Request.Step', policyName));
					dotty.put(flowsFound[index], 'Response.Step', this.removeStepByName(flowsFound[index], 'Response.Step', policyName));
				}
				
			} else if(_.isObject(flowsFound)) {
				dotty.put(flowsFound, 'Request.Step', this.removeStepByName(flowsFound[index], 'Request.Step', policyName));
				dotty.put(flowsFound, 'Response.Step', this.removeStepByName(flowsFound[index], 'Response.Step', policyName));
			}

			dotty.put(this._json, 'TargetEndpoint.Flows.Flow', flowsFound);
		}
		this.save();
	}
}

module.exports = TargetEndpoint;