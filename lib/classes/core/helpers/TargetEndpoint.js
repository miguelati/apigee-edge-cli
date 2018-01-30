const fs = require("fs-plus");
const fromXML = require("from-xml").fromXML;
const toXML = require("to-xml").toXML;
const _ = require("lodash");

class TargetEndpoint {
	constructor(targetEndpointName) {
		this._name = targetEndpointName;
		this._json = this.openProxyEndpointXML();
	}

	getName() {
		return this._json.TargetEndpoint["@name"];
	}

	setName(targetEndpointNewName) {
		this._name = targetEndpointNewName;
		this._json.TargetEndpoint["@name"] = targetEndpointNewName;
		this.save();
	}

	save() {
		let xml = toXML(this._json, null, 2);
		fs.writeFileSync(`./${global.actualRevision}/apiproxy/targets/${this._name}.xml`, xml, { encoding: 'utf8'});
	}

	getStepNames(path) {
		if(_.has(this._json, path)) {
			let found = _.get(this._json, path);
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

	getStep(path) {
		if(_.has(this._json, path)) {
			let found = _.get(this._json, path);
			if(_.isArray(found)) {
				return found.map((item) => { return {name: item.Name, condition: item.Condition || ""}});
			} else if(_.isObject(found)) {
				return [{name: found.Name, condition: found.Condition || ""}];
			} else {
				return [];
			}
		} else {
			return [];
		}
	}

	getStepNamesFromObj(obj, path) {
		if(_.has(obj, path)) {
			let found = _.get(obj, path);
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

	getStepFromObj(obj, path) {
		if(_.has(obj, path)) {
			let found = _.get(obj, path);
			if(_.isArray(found)) {
				return found.map((item) => { return {name: item.Name, condition: item.Condition || ""}});
			} else if(_.isObject(found)) {
				return [{name: found.Name, condition: found.Condition || ""}];
			} else {
				return [];
			}
		} else {
			return [];
		}
	}

	getFlowStepNamesByName(flowName, type) {
		if(_.has(this._json, 'TargetEndpoint.Flows.Flow')) {
			let flowsFound = _.get(this._json, 'TargetEndpoint.Flows.Flow');
			if(_.isArray(flowsFound)) {
				let flowFound = null;
				for(let index in flowsFound) {
					if(flowsFound[index]["@name"] === flowName) {
						flowFound = this.getStepNamesFromObj(flowsFound[index], `${type}.Step`);
					}
				}
				return (flowFound === null) ? [] : flowFound;
			} else if(_.isObject(flowsFound)) {
				let flowFound = null;
				if(flowsFound["@name"] === flowName) {
					flowFound = this.getStepNamesFromObj(flowsFound, `${type}.Step`);
				}
				return (flowFound === null) ? [] : flowFound;
			} else {
				return [];
			}
		} else {
			return [];
		}
	}

	getFlowStepByName(flowName, type) {
		if(_.has(this._json, 'TargetEndpoint.Flows.Flow')) {
			let flowsFound = _.get(this._json, 'TargetEndpoint.Flows.Flow');
			if(_.isArray(flowsFound)) {
				let flowFound = null;
				for(let index in flowsFound) {
					if(flowsFound[index]["@name"] === flowName) {
						flowFound = this.getStepFromObj(flowsFound[index], `${type}.Step`);
						break;
					}
				}
				return (flowFound === null) ? [] : flowFound;
			} else if(_.isObject(found)) {
				let flowFound = null;
				if(flowsFound["@name"] === flowName) {
					flowFound = this.getStepFromObj(flowsFound[index], `${type}.Step`);
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
		if(_.has(this._json, path)) {
			let found = _.get(this._json, path);
			if(_.isArray(found)) {
				return found.map((item) => item['@name']);
			} else if(_.isObject(found)) {
				return [found['@name']];
			} else {
				return [found];
			}
		} else {
			return [];
		}
	}

	checkFlows(path) {
		if(_.has(this._json, path)) {
			let found = _.get(this._json, path);
			if(_.isArray(found)) {
				return found.map((item) => { return {name: item['@name'], condition: item.Condition} });
			} else if(_.isObject(found)) {
				return [{name: found['@name'], condition: found.Condition}];
			} else {
				return [found];
			}
		} else {
			return [];
		}
	}

	openProxyEndpointXML() {
		
		if(fs.existsSync(`./${global.actualRevision}/apiproxy/targets/${this._name}.xml`)) {
			let content = fs.readFileSync(`./${global.actualRevision}/apiproxy/targets/${this._name}.xml`, 'utf8');
			return fromXML(content);
		} else {
			throw `./${global.actualRevision}/apiproxy/targets/${this._name}.xml doesn't exists!`;
		}
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

	getPreFlowRequestStep() {
		return this.getStep('TargetEndpoint.PreFlow.Request.Step');
	}

	getPreFlowResponseStep() {
		return this.getStep('TargetEndpoint.PreFlow.Response.Step');
	}

	getPostFlowRequestStep() {
		return this.getStep('TargetEndpoint.PostFlow.Request.Step');
	}

	getPostFlowResponseStep() {
		return this.getStep('TargetEndpoint.PostFlow.Response.Step');
	}

	getFlowsNames() {
		return this.checkFlowsNames('TargetEndpoint.Flows.Flow');
	}

	getFlows() {
		return this.checkFlows('TargetEndpoint.Flows.Flow');	
	}

	getFlowRequestStepNames(flowName) {
		return this.getFlowStepNamesByName(flowName, 'Request');
	}

	getFlowResponseStepNames(flowName) {
		return this.getFlowStepNamesByName(flowName, 'Response');
	}

	getFlowRequestStep(flowName) {
		return this.getFlowStepByName(flowName, 'Request');
	}

	getFlowResponseStep(flowName) {
		return this.getFlowStepByName(flowName, 'Response');
	}

	removeStepByName(obj, path, name) {
		if(_.has(obj, path)) {
			let step = _.get(obj, path);
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
			_.set(this._json, allPaths[index], this.removeStepByName(this._json, allPaths[index], policyName));
		}

		// remove All Flows
		if(_.has(this._json, 'TargetEndpoint.Flows.Flow')) {
			let flowsFound = _.get(this._json, 'TargetEndpoint.Flows.Flow');
			if(_.isArray(flowsFound)) {
				for(let index in flowsFound) {
					_.set(flowsFound[index], 'Request.Step', this.removeStepByName(flowsFound[index], 'Request.Step', policyName));
					_.set(flowsFound[index], 'Response.Step', this.removeStepByName(flowsFound[index], 'Response.Step', policyName));
				}
				
			} else if(_.isObject(flowsFound)) {
				_.set(flowsFound, 'Request.Step', this.removeStepByName(flowsFound[index], 'Request.Step', policyName));
				_.set(flowsFound, 'Response.Step', this.removeStepByName(flowsFound[index], 'Response.Step', policyName));
			}

			_.set(this._json, 'TargetEndpoint.Flows.Flow', flowsFound);
		}
		this.save();
	}

	renameStepByName(obj, path, oldName, newName) {
		if(_.has(obj, path)) {
			let step = _.get(obj, path);
			if(_.isArray(step)) {
				let stepIndex = _.findIndex(step, (item) =>  item.Name == oldName);
				if(stepIndex !== -1) step[stepIndex].Name = newName;
				return step;
			} else if (_.isObject(step)) {
				if (step.Name === oldName) step.Name = newName;
				return step;
			}	
		}
	}

	renameAllStepsByName(policyOldName, policyNewName) {

		let allPaths = [
			'TargetEndpoint.FaultRules.FaultRule.Step',
			'TargetEndpoint.PreFlow.Request.Step',
			'TargetEndpoint.PreFlow.Response.Step',
			'TargetEndpoint.PostFlow.Request.Step',
			'TargetEndpoint.PostFlow.Response.Step'
		];

		for(let index in allPaths) {
			_.set(this._json, allPaths[index], this.renameStepByName(this._json, allPaths[index], policyOldName, policyNewName));
		}

		// remove All Flows
		if(_.has(this._json, 'TargetEndpoint.Flows.Flow')) {
			let flowsFound = _.get(this._json, 'TargetEndpoint.Flows.Flow');
			if(_.isArray(flowsFound)) {
				for(let index in flowsFound) {
					_.set(flowsFound[index], 'Request.Step', this.renameStepByName(flowsFound[index], 'Request.Step', policyOldName, policyNewName));
					_.set(flowsFound[index], 'Response.Step', this.renameStepByName(flowsFound[index], 'Response.Step', policyOldName, policyNewName));
				}
				
			} else if(_.isObject(flowsFound)) {
				_.set(flowsFound, 'Request.Step', this.renameStepByName(flowsFound, 'Request.Step', policyOldName, policyNewName));
				_.set(flowsFound, 'Response.Step', this.renameStepByName(flowsFound, 'Response.Step', policyOldName, policyNewName));
			}

			_.set(this._json, 'ProxyEndpoint.Flows.Flow', flowsFound);
		}

		this.save();
	}

	moveFlow(name, index) {
		name = name.replace(/\"/g, "");
		let obj = _.get(this._json, 'TargetEndpoint.Flows.Flow');
		
		if(_.isArray(obj)) {
			let aux = _.remove(obj, (o) => o["@name"] == name);
			obj.splice(index, 0, aux[0]);
			_.set(this._json, 'TargetEndpoint.Flows.Flow', obj);
			this.save();
		}
	}

}

module.exports = TargetEndpoint;