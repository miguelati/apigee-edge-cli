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
}

module.exports = TargetEndpoint;