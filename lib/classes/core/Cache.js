const fs = require("fs-plus");
const _ = require("lodash");
const dotty = require("dotty");
const vorpal = require('vorpal')();
const chalk = vorpal.chalk;
const fromXML = require("from-xml").fromXML;
const moment = require("moment");
const rimraf = require("rimraf");

class Cache {
	static load(path = "./apiproxy/") {
		let proxy = new Cache(path);
	}

	clearCache(id) {
		var path = require('path');
		const os = require('os');
		const temp = path.normalize(path.join(os.tmpdir(), '/.local_storage_'));
		rimraf.sync(temp + this._id);
		global.localStorage(this._id);
	}

	constructor(path) {
		this._path = path;
		this._id = "edge-client";
		this.clearCache();
		this.loadApiproxyXml();
		this.loadProxys();
		this.loadTargets();
	}

	loadApiproxyXml() {
		let xml = fs.listSync(this._path, ["xml"]);
		if(xml.length == 1) {
			let apiproxyContent = fs.readFileSync(xml[0], 'utf8');
			let json = fromXML(apiproxyContent);

			this.setValue('apiproxy.name', json.APIProxy["@name"]);
			this.setValue('apiproxy.revision', json.APIProxy["@revision"]);
			this.setValue('apiproxy.displayName', json.APIProxy.DisplayName);
			this.setValue('apiproxy.basepaths', json.APIProxy.Basepaths);
			this.setValue('apiproxy.createdAt', json.APIProxy.CreatedAt, 'date');
			this.setValue('apiproxy.createdBy', json.APIProxy.CreatedBy);
			this.setValue('apiproxy.lastModifiedAt', json.APIProxy.LastModifiedAt, 'date');
			this.setValue('apiproxy.lastModifiedBy', json.APIProxy.LastModifiedBy);
			this.setValue('apiproxy.policies', json.APIProxy.Policies.Policy, 'object');
			this.setValue('apiproxy.proxyEndpoints', json.APIProxy.ProxyEndpoints.ProxyEndpoint, 'object');
			this.setValue('apiproxy.targetEndpoints', json.APIProxy.TargetEndpoints.TargetEndpoint, 'object');
			
		} else {
			//console.log("error");
		}
	}

	loadProxys() {
		let xml = fs.listSync(this._path + "proxies/", ["xml"]);

		for(let index in xml) {
			this.loadProxy(xml[index]);
		}
	}

	loadProxy(file) {
		let apiproxyContent = fs.readFileSync(file, 'utf8');
		let json = fromXML(apiproxyContent);

		this.setValue('proxy.'+ json.ProxyEndpoint["@name"] +'.name', json.ProxyEndpoint["@name"]);
		this.setValue('proxy.'+ json.ProxyEndpoint["@name"] +'.description', json.ProxyEndpoint.Description);

		// FaultRules
		this.setMultiFaultRules('proxy.'+ json.ProxyEndpoint["@name"] +'.faultRules', json.ProxyEndpoint.FaultRules);

		// PreFlow
		this.setValue('proxy.'+ json.ProxyEndpoint["@name"] +'.preflow.name', json.ProxyEndpoint.PreFlow["@name"]);
		this.setSteps('proxy.'+ json.ProxyEndpoint["@name"] +'.preflow.request', json.ProxyEndpoint.PreFlow.Request);
		this.setSteps('proxy.'+ json.ProxyEndpoint["@name"] +'.preflow.response', json.ProxyEndpoint.PreFlow.Response);

		// PostFlow
		this.setValue('proxy.'+ json.ProxyEndpoint["@name"] +'.postflow.name', json.ProxyEndpoint.PostFlow["@name"]);
		this.setSteps('proxy.'+ json.ProxyEndpoint["@name"] +'.postflow.request', json.ProxyEndpoint.PostFlow.Request);
		this.setSteps('proxy.'+ json.ProxyEndpoint["@name"] +'.postflow.response', json.ProxyEndpoint.PostFlow.Response);

		// Flows
		this.setMultiFlows('proxy.'+ json.ProxyEndpoint["@name"] +'.flows', json.ProxyEndpoint.Flows);

		// HTTPProxyConnection
		this.setValue('proxy.'+ json.ProxyEndpoint["@name"] +'.httpProxyConnection.basepath', json.ProxyEndpoint.HTTPProxyConnection.BasePath);
		this.setProperties('proxy.'+ json.ProxyEndpoint["@name"] +'.httpProxyConnection.properties', json.ProxyEndpoint.HTTPProxyConnection.Properties);
		this.setValue('proxy.'+ json.ProxyEndpoint["@name"] +'.httpProxyConnection.virtualhosts', json.ProxyEndpoint.HTTPProxyConnection.VirtualHost, 'object');
	}

	loadTargets() {
		let xml = fs.listSync(this._path + "targets/", ["xml"]);

		for(let index in xml) {
			this.loadTarget(xml[index]);
		}
	}

	loadTarget(file) {
		let apiproxyContent = fs.readFileSync(file, 'utf8');
		let json = fromXML(apiproxyContent);

		this.setValue('target.'+ json.TargetEndpoint["@name"] +'.name', json.TargetEndpoint["@name"]);
		this.setValue('target.'+ json.TargetEndpoint["@name"] +'.description', json.TargetEndpoint.Description);
		
		// PreFlow
		this.setValue('target.'+ json.TargetEndpoint["@name"] +'.preflow.name', json.TargetEndpoint.PreFlow["@name"]);
		this.setSteps('target.'+ json.TargetEndpoint["@name"] +'.preflow.request', json.TargetEndpoint.PreFlow.Request);
		this.setSteps('target.'+ json.TargetEndpoint["@name"] +'.preflow.response', json.TargetEndpoint.PreFlow.Response);
		
		// PostFlow
		this.setValue('target.'+ json.TargetEndpoint["@name"] +'.postflow.name', json.TargetEndpoint.PostFlow["@name"]);
		this.setSteps('target.'+ json.TargetEndpoint["@name"] +'.postflow.request', json.TargetEndpoint.PostFlow.Request);
		this.setSteps('target.'+ json.TargetEndpoint["@name"] +'.postflow.response', json.TargetEndpoint.PostFlow.Response);
		
		// Flows
		this.setMultiFlows('target.'+ json.TargetEndpoint["@name"] +'.flows', json.TargetEndpoint.Flows);

		// HTTPTargetConnection
		if(!_.isUndefined(json.TargetEndpoint.HTTPTargetConnection)) {
			this.setProperties('target.'+ json.TargetEndpoint["@name"] +'.httpTargetConnection.properties', json.TargetEndpoint.HTTPTargetConnection.Properties);
			this.setValue('target.'+ json.TargetEndpoint["@name"] +'.httpTargetConnection.url', json.TargetEndpoint.HTTPTargetConnection.URL);	
		}

		

		if(!_.isUndefined(json.TargetEndpoint.ScriptTarget)) {
			this.setProperties('target.'+ json.TargetEndpoint["@name"] +'.scriptTarget.properties', json.TargetEndpoint.ScriptTarget.Properties);
			this.setArguments('target.'+ json.TargetEndpoint["@name"] +'.scriptTarget.arguments', json.TargetEndpoint.ScriptTarget.Arguments);
			this.setValue('target.'+ json.TargetEndpoint["@name"] +'.scriptTarget.resourceUrl', json.TargetEndpoint.ScriptTarget.ResourceURL);
			this.setEnvironmentVariables('target.'+ json.TargetEndpoint["@name"] +'.scriptTarget.enviromentVariables', json.TargetEndpoint.ScriptTarget.EnvironmentVariables);
		}
		
	}

	setMultiFaultRules(key, faultRules) {
		if(_.isNil(faultRules)) {
			this.setValue(key, '');
		} else if(_.isArray(faultRules.FaultRule)) {
			let nameFaultRules = [];
			for(let index in faultRules.FaultRule) {
				this.setRequestAndResponse(key + "." + faultRules.FaultRule[index]['@name'], faultRules.FaultRule[index]);
				nameFaultRules.push(faultRules.FaultRule[index]['@name']);
			}
			this.setValue(key + ".nameFaultRules", nameFaultRules, 'object');
		} else {
			this.setRequestAndResponse(key + "." + faultRules.FaultRule['@name'], faultRules.FaultRule);
			this.setValue(key + ".nameFaultRules", [faultRules.FaultRule['@name']], 'object');
		}
	}

	setMultiFlows(key, flows) {
		if(_.isNil(flows)) {
			this.setValue(key, '');
		} else if(_.isArray(flows.Flow)) {
			let nameFlows = [];
			for(let index in flows.Flow) {
				this.setRequestAndResponse(key + "." + flows.Flow[index]['@name'], flows.Flow[index]);
				nameFlows.push(flows.Flow[index]['@name']);
			}
			this.setValue(key + ".nameFlows", nameFlows, 'object');
		} else {
			this.setRequestAndResponse(key + "." + flows.Flow['@name'], flows.Flow);
			this.setValue(key + ".nameFlows", [flows.Flow['@name']], 'object');
		}
	}

	setRequestAndResponse(key, content) {
		this.setSteps(key + '.request', content.Request);
		this.setSteps(key + '.response', content.Response);
	}

	setProperties(key, content) {
		if(_.isNil(content)) {
			this.setValue(key, '');
		} else {
			let properties = this.getProperties(content.Property);
			this.setValue(key, properties, 'object');
		}
	}

	setSteps(key, content) {
		if(_.isNil(content) || _.isEmpty(content)) {
			this.setValue(key, '');
		} else {
			let steps = this.getSteps(content.Step);
			this.setValue(key, steps, 'object');
		}
	}

	getSteps(steps) {
		let stepsToReturn = [];
		if(_.isArray(steps)) {
			for(let index in steps) {
				stepsToReturn.push({name: steps[index].Name, condition: _.toString(steps[index].Condition)})
			}
		} else {
			stepsToReturn.push({name: steps.Name, condition: _.toString(steps.Condition)})
		}
		return stepsToReturn;
	}

	setArguments(key, content) {
		if(_.isNil(content) || _.isEmpty(content)) {
			this.setValue(key, '');
		} else {
			let args = this.getArguments(content.Argument);
			this.setValue(key, args, 'object');
		}
	}

	getArguments(args) {
		if(_.isArray(args)) {
			return args;
		} else {
			return [args];
		}
	}

	setEnvironmentVariables(key, content) {
		if(_.isNil(content) || _.isEmpty(content)) {
			this.setValue(key, '');
		} else {
			this.setEachEnvironmentVariables(key, content.EnvironmentVariable);
		}
	}

	setEachEnvironmentVariables(envs) {
		let envNames = [];
		if(_.isArray(envs)) {
			for(let index in envs) {
				this.setValue(key + "." + envs[index]["@name"], envs[index]["#"]);
				envNames.push(envs[index]["@name"])
			}
		} else {
			this.setValue(key + "." + envs["@name"], envs["#"]);
			envNames.push(envs["@name"])
		}
		this.setValue(key + ".enviromentsVarsNames", envNames, 'object');
	}

	getProperties(properties) {
		let propertiesToReturn = [];
		if(_.isArray(properties)) {
			for(let index in propertiesToReturn) {
				propertiesToReturn.push({name: properties[index]['@name'], content: properties[index]['#']})
			}
		} else {
			propertiesToReturn.push({name: properties['@name'], content: properties['#']})
		}
		return propertiesToReturn;
	}

	setValue(key, value, type = 'string') {
		let setValue = "";
		if(type == 'date') {
			setValue = moment().millisecond(Number(value) / 1000).format('MMMM Do YYYY, h:mm:ss a')
		} else if(type == 'object') {
			setValue = JSON.stringify(value);
		} else if(type == 'string') {
			setValue = _.toString(value);
		}

		global.localStorage.setItem(key, setValue);
	}
	
}

module.exports = Cache;