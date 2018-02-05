const fs = require("fs-plus");
const APIProxyHelper = require('../../helpers/APIProxy');
const ProxyEndpointHelper = require('../../helpers/ProxyEndpoint');
const _ = require("lodash");
const ApiProxyRest = require('../../../apigee/ApiProxyRest');

class Resource {
	static process(vorpal, type, resourceName, state) {
		let me = new Resource(vorpal, type, resourceName);
		if(_.hasIn(me, state)) me[state]();
	}

	constructor(vorpal, type,  resourceName) {
		this._vorpal = vorpal;
		this._resourceName = resourceName;
		this._type = type;
		this._resourceUrl = `${type}://${resourceName}`;
		this._resourceNameWithColor = global.chalk.yellow(`${this._resourceName} (${this._type})`);
	}

	add() {
		global.watcher.unwatch('apiproxy');
		APIProxyHelper.addResource(this._resourceUrl);
		this._vorpal.ui.imprint();
		global.output.success(`${this._resourceNameWithColor} Resoruce was added!`);
		global.watcher.add('apiproxy', `./${global.actualRevision}/apiproxy/`);
		if(global.prefs.live.upload) this.liveUpload("create");
	}

	change() {
		if(global.prefs.live.upload) this.liveUpload("update");
	}

	unlink() {
		global.watcher.unwatch('apiproxy');
		APIProxyHelper.removeResource(this._resourceUrl);
		this._vorpal.ui.imprint();
		global.output.success(`${this._resourceNameWithColor} Resoruce was removed!`);
		global.watcher.add('apiproxy', `./${global.actualRevision}/apiproxy/`);
		if(global.prefs.live.upload) this.liveUpload("delete");
	}

	async liveUpload(type) {
		try {
			let body = "";
			if(fs.existsSync(`./${global.actualRevision}/apiproxy/resources/${this._type}/${this._resourceName}`)) {
				body = fs.readFileSync(`./${global.actualRevision}/apiproxy/resources/${this._type}/${this._resourceName}`, 'utf8');
			}
			let info = APIProxyHelper.getInfo();
			let response = await ApiProxyRest[type + 'Resource']({name: info.name, revision: info.revision, body: body, resourceName: this._resourceName, resourceType: this._type}, global.prefs.apigee);
			this._vorpal.ui.imprint();
			let apiProxyNameWithColor = global.chalk.yellow(info.name); 
			global.output.success(`Resource ${this._resourceNameWithColor} was ${type}d in APIProxy ${apiProxyNameWithColor}`);
		} catch(e) {
			this._vorpal.ui.imprint();
			global.output.error(e);
		}
	}
}

module.exports = Resource;