const fs = require("fs-plus");
const APIProxyHelper = require('../../helpers/APIProxy');
const ProxyEndpointHelper = require('../../helpers/ProxyEndpoint');
const _ = require("lodash");

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
	}

	add() {
		global.watcher.unwatch('./apiproxy/');
		APIProxyHelper.addResource(this._resourceUrl);
		this._vorpal.ui.imprint();
		global.output.success(`${this._resourceName} Resoruce was added!`);
		global.watcher.add('./apiproxy/');
	}

	change() {
		// TODO: Add Live Upload!
	}

	unlink() {
		global.watcher.unwatch('./apiproxy/');
		APIProxyHelper.removeResource(this._resourceUrl);
		this._vorpal.ui.imprint();
		global.output.success(`${this._resourceName} Resoruce was removed!`);
		global.watcher.add('./apiproxy/');
	}
}

module.exports = Resource;