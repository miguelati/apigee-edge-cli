const fs = require("fs-plus");
const fromXML = require("from-xml").fromXML;
const toXML = require("to-xml").toXML;
const _ = require("lodash");
const moment = require("moment");

class APIProxy {

	constructor() {
		this._json = this.openAPIProxyXML();
		this._paths = {
			policy: 'APIProxy.Policies.Policy',
			targetEndpoint: 'APIProxy.TargetEndpoints.TargetEndpoint',
			proxyEndpoint: 'APIProxy.ProxyEndpoints.ProxyEndpoint',
			resource: 'APIProxy.Resources.Resource'
		};
	}

	openAPIProxyXML() {
		if(fs.existsSync(`./${global.actualRevision}/apiproxy/`)) {
			let xml = fs.listSync(`./${global.actualRevision}/apiproxy/`, ["xml"]);
			let apiproxyContent = fs.readFileSync(xml[0], 'utf8');
			return fromXML(apiproxyContent);	
		} else {
			throw `./${global.actualRevision}/apiproxy folder doesn't exists!`;
		}
	}

	getInfo() {
		return {
			name: this._json.APIProxy["@name"],
			revision: this._json.APIProxy["@revision"],
			basepaths: (this._json.APIProxy.Basepaths === undefined) ? "" : this._json.APIProxy.Basepaths,
			configurationVersion: {
				majorVersion: this._json.APIProxy.ConfigurationVersion["@majorVersion"],
				minorVersion: this._json.APIProxy.ConfigurationVersion["@minorVersion"]
			},
			createdAt: {
				raw: this._json.APIProxy.CreatedAt,
				display: moment(parseInt(this._json.APIProxy.CreatedAt)).format("MMM Do, YYYY hh:mm a")
			},
			createdBy: this._json.APIProxy.CreatedBy,
			lastModifiedAt: {
				raw: this._json.APIProxy.LastModifiedAt,
				display: moment(parseInt(this._json.APIProxy.LastModifiedAt)).format("MMM Do, YYYY hh:mm a")
			},
			lastModifiedBy: this._json.APIProxy.LastModifiedBy,
			displayName: this._json.APIProxy.DisplayName,
			validate: this._json.APIProxy.validate
		};	
	}

	changeRevision(revisionNumber) {
		_.set(this._json, 'APIProxy.@revision', revisionNumber);
		this.save();
	}

	static changeRevision(revisionNumber) {
		let me = new APIProxy();
		return me.changeRevision(revisionNumber);
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
		fs.writeFileSync(`./${global.actualRevision}/apiproxy/${this._json.APIProxy["@name"]}.xml`, xml, { encoding: 'utf8'});
	}

	add(type, name) {
		if(_.has(this._json, this._paths[type])) {
			let object = _.get(this._json, this._paths[type]);
			_.set(this._json, this._paths[type], this.addToObject(object, name));
			this.save();
		}
	}

	exists(type, name) {
		if(_.has(this._json, this._paths[type])) {
			return this.verifyIfExists(_.get(this._json, this._paths[type]), name);
		} else {
			return false;
		}
	}

	get(type) {
		if(_.has(this._json, this._paths[type])) {
			let obj = _.get(this._json, this._paths[type]);
			return this.getObject(obj);
		} else {
			return [];
		}
	}

	remove(type, name) {
		if(_.has(this._json, this._paths[type])) {
			let object = _.get(this._json, this._paths[type]);
			_.set(this._json, this._paths[type], this.removeObject(object, name));
			this.save();
		}
	}

	rename(type, oldName, newName) {
		if(_.has(this._json, this._paths[type])) {
			let object = _.get(this._json, this._paths[type]);
			let index = _.findIndex(object, (item) =>  item == oldName);
			if(index !== -1) {
				object[index] = newName;
				_.set(this._json, this._paths[type], object);
				this.save();	
			}
		}
	}

	static getProxyEndpoints() {
		try {
			let me = new APIProxy();
			return me.get('proxyEndpoint');
		} catch(e) {
			return [];
		}
	}

	static getTargetEndpoints() {
		try {
			let me = new APIProxy();
			return me.get('targetEndpoint');
		} catch(e) {
			return [];
		}
	}

	static getPolicies() {
		try {
			let me = new APIProxy();
			return me.get('policy');
		} catch(e) {
			return [];
		}
	}

	static getResources() {
		try {
			let me = new APIProxy();
			return me.get('resource');
		} catch(e) {
			return [];
		}
	}

	static existsProxyEndpoint(name) {
		try {
			let me = new APIProxy();
			return me.exists('proxyEndpoint', name);	
		} catch(e) {
			throw e;
		}
	}

	static existsTargetEndpoint(name) {
		try {
			let me = new APIProxy();
			return me.exists('targetEndpoint', name);
		} catch(e) {
			throw e;
		}
	}

	static existsPolicy(name) {
		try {
			let me = new APIProxy();
			return me.exists('policy', name);	
		} catch(e) {
			throw e;
		}
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

	static addResource(name) {
		let me = new APIProxy();
		me.add('resource', name);	
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

	static removeResource(name) {
		let me = new APIProxy();
		me.remove('resource', name);
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