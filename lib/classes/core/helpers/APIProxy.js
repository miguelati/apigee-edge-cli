const fs = require("fs-plus");
const fromXML = require("from-xml").fromXML;
const toXML = require("to-xml").toXML;
const _ = require("lodash");
const moment = require("moment");
const dotty = require('dotty');

class APIProxy {

	constructor() {
		this._json = this.openAPIProxyXML();
		this._paths = {
			policy: 'APIProxy.Policies.Policy',
			targetEndpoint: 'APIProxy.TargetEndpoints.TargetEndpoint',
			proxyEndpoint: 'APIProxy.ProxyEndpoints.ProxyEndpoint'
		};
	}

	openAPIProxyXML() {
		if(fs.existsSync('./apiproxy/')) {
			let xml = fs.listSync("./apiproxy/", ["xml"]);
			let apiproxyContent = fs.readFileSync(xml[0], 'utf8');
			return fromXML(apiproxyContent);	
		} else {
			return false;
		}
	}

	getInfo() {
		let json = this.openAPIProxyXML()
		
		if(json !== false) {
			return {
				name: json.APIProxy["@name"],
				revision: json.APIProxy["@revision"],
				basepaths: (json.APIProxy.Basepaths === undefined) ? "" : json.APIProxy.Basepaths,
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
		} else {
			return false;
		}
	}

	static getInfo() {
		let me = new APIProxy();
		return me.getInfo();
	}

	addToObject(object, text) {
		if(_.isArray(object)) {
			object.push(text);
			return object;
		} else if(_.isString(object)) {
			let newObject = [object, text];
			return newObject;
		}
		return null;
	}

	removeObject(object, text) {
		if(_.isArray(object)) {
			_.remove(object, (obj) => obj == text);
		} else if (_.isString(object) && object == text) {
			return null;
		}
		return object;
	}

	getObject(object) {
		if(_.isArray(object)) {
			return object;
		} else {
			return [object];
		}
	}

	verifyIfExists(object, text) {
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

	save() {
		let xml = toXML(this._json, null, 2);
		fs.writeFileSync(`./apiproxy/${this._json.APIProxy["@name"]}.xml`, xml, { encoding: 'utf8'});
	}

	add(type, name) {
		if(dotty.exists(json, this._paths[type])) {
			let object = dotty.get(json, this._paths[type]);
			dotty.put(this._json, this._paths[type], this.addToObject(object, name));
			this.save();
		}
	}

	exists(type, name) {
		if(dotty.exists(this._json, this._paths[type])) {
			return this.verifyIfExists(dotty.get(this._json, this._paths[type]), name);
		} else {
			return false;
		}
	}

	get(type) {
		if(dotty.exists(this._json, this._paths[type])) {
			let obj = dotty.get(this._json, this._paths[type]);
			return this.getObject(obj);
		} else {
			return [];
		}
	}

	remove(type, name) {
		if(dotty.exists(this._json, this._paths[type])) {
			let object = dotty.get(this._json, this._paths[type]);
			dotty.put(this._json, this._paths[type], this.removeObject(object, name));
			this.save();
		}
	}

	rename(type, oldName, newName) {
		if(dotty.exists(this._json, this._paths[type])) {
			let object = dotty.get(this._json, this._paths[type]);
			let index = _.findIndex(object, (item) =>  item == oldName);
			if(index !== -1) {
				object[index] = newName;
				dotty.put(this._json, this._paths[type], object);
				this.save();	
			}
		}
	}

	static getProxyEndpoints() {
		let me = new APIProxy();
		return me.get('proxyEndpoint');
	}

	static getTargetEndpoints() {
		let me = new APIProxy();
		return me.get('targetEndpoint');
	}

	static getPolicies() {
		let me = new APIProxy();
		return me.get('policy');
	}

	static existsProxyEndpoint(name) {
		let me = new APIProxy();
		return me.exists('proxyEndpoint', name);	
	}

	static existsTargetEndpoint(name) {
		let me = new APIProxy();
		return me.exists('targetEndpoint', name);	
	}

	static existsPolicy(name) {
		let me = new APIProxy();
		return me.exists('policy', name);	
	}

	static addProxyEndpoint(name) {
		let me = new APIProxy();
		me.add('proxyEndpoint', name);	
	}

	static addTargetEndpoint(name) {
		let me = new APIProxy();
		me.add('targetEndpoint', name);	
	}

	static addPolicy(name) {
		let me = new APIProxy();
		me.add('policy', name);	
	}

	static removeProxyEndpoint(name) {
		let me = new APIProxy();
		me.remove('proxyEndpoint', name);
	}

	static removeTargetEndpoint(name) {
		let me = new APIProxy();
		me.remove('targetEndpoint', name);	
	}

	static removePolicy(name) {
		let me = new APIProxy();
		me.remove('policy', name);	
	}

	static renameProxyEndpoint(oldName, newName) {
		let me = new APIProxy();
		me.rename('proxyEndpoint', oldName, newName);
	}

	static renameTargetEndpoint(oldName, newName) {
		let me = new APIProxy();
		me.rename('targetEndpoint', oldName, newName);	
	}

	static renamePolicy(oldName, newName) {
		let me = new APIProxy();
		me.rename('policy', oldName, newName);
	}
}

module.exports = APIProxy;