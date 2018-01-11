const APIProxyRest = require('../apigee/ApiProxyRest');
const APIProxyHelper = require('./helpers/APIProxy');
const fs = require('fs-plus');
const _ = require('lodash');
const Watcher = require("./Watcher");
const Output = require("./helpers/Output");
const Preferences = require("preferences");

class Enviroment {
	static getAllRevisionsDownloaded() {
		return fs.listSync('./').filter(item => fs.isDirectorySync(item) && !item.startsWith('.')).sort();
	}

	static getLastRevisionDownloaded() {
		let directories = Enviroment.getAllRevisionsDownloaded();
		return (_.isEmpty(directories)) ? null : _.last(directories);
	}
	
	static async verifyRevision(apiproxyName) {
		let allRevision = await APIProxyRest.getRevisions({apiproxyName: apiproxyName}, global.prefs.apigee);
	}

	static delimiter() {
		return (global.actualRevision === null) ? `${global.apiproxyName}$` : `${global.apiproxyName}(Rev${global.actualRevision})\$`;
	}

	static setRevision(vorpal) {
		global.actualRevision = Enviroment.getLastRevisionDownloaded();
		global.apiproxyName = "edge";
		if(global.actualRevision !== null && fs.existsSync(`./${global.actualRevision}/apiproxy/`)) {
			global.apiproxyName = APIProxyHelper.getInfo().name;
			global.watcher.add(`./${global.actualRevision}/apiproxy/`);
		} else {
			global.actualRevision = null;
		}
		vorpal.history(global.apiproxyName);
		global.prefs = new Preferences(global.apiproxyName, global.prefs);
		vorpal.delimiter(global.chalk.green(Enviroment.delimiter()));
	}

	static changeRevision(revisionNumber, vorpal) {
		global.watcher.unwatch(`./${global.actualRevision}/apiproxy/`);
		global.actualRevision = revisionNumber;
		global.apiproxyName = "edge";
		if(fs.existsSync(`./${global.actualRevision}/apiproxy/`)) {
			global.apiproxyName = APIProxyHelper.getInfo().name;
			global.watcher.add(`./${global.actualRevision}/apiproxy/`);
		} else {
			global.actualRevision = null;
		}
		vorpal.history(global.apiproxyName);
		global.prefs = new Preferences(global.apiproxyName, global.prefs);
		vorpal.delimiter(global.chalk.green(Enviroment.delimiter()));
	}

	static init(vorpal) {
		global.chalk = vorpal.chalk;
		global.prompt = vorpal.prompt;
		global.output = new Output(vorpal);
		global.actualRevision = Enviroment.getLastRevisionDownloaded();
		global.apiproxyName = "edge";

		if(global.actualRevision !== null && fs.existsSync(`./${global.actualRevision}/apiproxy/`)) {
			global.apiproxyName = APIProxyHelper.getInfo().name;
		}

		let defaults = {apigee: {}, live: {validation: true, upload: false}};

		if(!_.isEmpty(process.env.APIGEE_USERNAME)) defaults.apigee.username = process.env.APIGEE_USERNAME;
		if(!_.isEmpty(process.env.APIGEE_PASSWORD)) defaults.apigee.password = process.env.APIGEE_PASSWORD; 
		if(!_.isEmpty(process.env.API_ORGANIZATION)) defaults.apigee.organization = process.env.API_ORGANIZATION; 

		global.prefs = new Preferences(global.apiproxyName, defaults);
		global.watcher = new Watcher(vorpal);
	}
}

module.exports = Enviroment;