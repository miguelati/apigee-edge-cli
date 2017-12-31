const fs = require("fs-plus");
const fromXML = require("from-xml").fromXML;
const toXML = require("to-xml").toXML;
const _ = require("lodash");
const moment = require("moment");
const dotty = require('dotty');

class APIProxy {
	static openAPIProxyXML() {
		if(fs.existsSync('./apiproxy/')) {
			let xml = fs.listSync("./apiproxy/", ["xml"]);
			let apiproxyContent = fs.readFileSync(xml[0], 'utf8');
			return fromXML(apiproxyContent);	
		} else {
			return ;
		}
	}

	static getInfo() {
		let json = APIProxy.openAPIProxyXML()
		
		return {
			name: json.APIProxy["@name"],
			revision: json.APIProxy["@revision"],
			basepaths: json.APIProxy.Basepaths,
			configurationVersion: {
				majorVersion: json.APIProxy.ConfigurationVersion["@majorVersion"],
				minorVersion: json.APIProxy.ConfigurationVersion["@minorVersion"]
			},
			createdAt: {
				raw: json.APIProxy.CreatedAt,
				display: moment(parseInt(json.APIProxy.CreatedAt)).format("MMM Do, YYYY hh:mm a")
			},
			createdBy: json.APIProxy.CreatedBy,
			lastModifiedAt: {
				raw: json.APIProxy.LastModifiedAt,
				display: moment(parseInt(json.APIProxy.LastModifiedAt)).format("MMM Do, YYYY hh:mm a")
			},
			lastModifiedBy: json.APIProxy.LastModifiedBy,
			displayName: json.APIProxy.DisplayName,
			validate: json.APIProxy.validate
		};
	}

	static add(object, text) {
		if(_.isArray(object)) {
			object.push(text);
			return object;
		} else if(_.isString(object)) {
			let newObject = [object, text];
			return newObject;
		}
		return null;
	}

	static get(object) {
		if(_.isArray(object)) {
			return object;
		} else {
			return [object];
		}
	}

	static save(json) {
		let xml = toXML(json, null, 2);
		fs.writeFileSync(`./apiproxy/${json.APIProxy["@name"]}.xml`, xml, { encoding: 'utf8'});
	}

	static addPolicy(policyName) {
		let json = APIProxy.openAPIProxyXML();
		json.APIProxy.Policies.Policy = APIProxy.add(json.APIProxy.Policies.Policy, policyName);
		APIProxy.save(json);
	}

	static addProxyEndpoint(proxyEndpointName) {
		let json = APIProxy.openAPIProxyXML();
		json.APIProxy.ProxyEndpoints.ProxyEndpoint = APIProxy.add(json.APIProxy.ProxyEndpoints.ProxyEndpoint, proxyEndpointName);
		APIProxy.save(json);
	}

	static addTargetEndpoint(targetEndpointName) {
		let json = APIProxy.openAPIProxyXML();
		json.APIProxy.TargetEndpoints.TargetEndpoint = APIProxy.add(json.APIProxy.TargetEndpoints.TargetEndpoint, targetEndpointName);
		APIProxy.save(json);
	}

	static verifyIfExists(object, text) {
		if(_.isArray(object)) {
			for(let index in object) {
				if(object[index] === text) {
					return true;
				}
			}
			return false;
		} else if(_.isString(object)) {
			if(object === text) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}

	static existsPolicy(policyName) {
		let json = APIProxy.openAPIProxyXML()
		return APIProxy.verifyIfExists(json.APIProxy.Policies.Policy, policyName);
	}

	static existsProxyEndpoint(proxyEndpointName) {
		let json = APIProxy.openAPIProxyXML()
		return APIProxy.verifyIfExists(json.APIProxy.ProxyEndpoints.ProxyEndpoint, proxyEndpointName);
	}

	static existsTargetEndpoint(targetEndpointName) {
		let json = APIProxy.openAPIProxyXML()
		return APIProxy.verifyIfExists(json.APIProxy.TargetEndpoints.TargetEndpoint, targetEndpointName);
	}

	static getProxyEndpoints() {
		let json = APIProxy.openAPIProxyXML()
		if(dotty.exists(json, 'APIProxy.ProxyEndpoints.TargetEndpoint')) {
			return APIProxy.get(json.APIProxy.ProxyEndpoints.ProxyEndpoint);
		} else {
			return [];
		}
	}

	static getTargetEndpoints() {
		let json = APIProxy.openAPIProxyXML()
		if(dotty.exists(json, 'APIProxy.TargetEndpoints.TargetEndpoint')) {
			return APIProxy.get(json.APIProxy.TargetEndpoints.TargetEndpoint);	
		} else {
			return [];
		}
	}

	static getPolicies() {
		let json = APIProxy.openAPIProxyXML()
		if(dotty.exists(json, 'APIProxy.Policies.Policy')) {
			return APIProxy.get(json.APIProxy.Policies.Policy);
		} else {
			return [];
		}
		
	}
}

module.exports = APIProxy;