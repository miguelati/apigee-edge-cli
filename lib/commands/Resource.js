const fs = require("fs-plus");
const _ = require("lodash");
const Command = require("../classes/core/Command");
const APIProxyHelper = require("../classes/core/helpers/APIProxy");
const Autocomplete = require("../classes/core/helpers/Autocomplete");
const TagFactory = require("../classes/xml/TagFactory");
const ApiProxyRest = require('../classes/apigee/ApiProxyRest');
const Zipper = require('../classes/core/helpers/Zipper');
const Spinner = require('../classes/core/ui/Spinner');

class Resource {
	static injectCommand(vorpal) {
		vorpal
		.command('resource open <resourceName>', 'Open resource in node')
		//.option('-t,--type <type>', 'Type of resource', ['jsc', 'java', 'py', 'node', 'wsdl', 'xsd', 'xsl'])
		.autocomplete(Autocomplete.getResources())
		.action(async (args, callback) => {
			try {
				args.resourceName = args.resourceName.replace(new RegExp("\\\\", 'g'), "/");
				
				if(APIProxyHelper.existsResource(`${args.resourceName}`)) {
					let resource = {
						type: args.resourceName.split("://")[0],
						name: args.resourceName.split("://")[1]
					};
					await Command.openFile(`./${global.actualRevision}/apiproxy/resources/${resource.type}/${resource.name}`);
				} else global.output.error(`Resource ${args.resourceName} doesn't exists!!`);
			} catch(e) {
				global.output.error();
			} finally {
				callback();
			}
		});

		vorpal
		.command('resource update <resourceName>', 'Upload resource in node to apigee')
		.autocomplete(Autocomplete.getResources())
		.action(async (args, callback) => {
			try {
				args.resourceName = args.resourceName.replace(new RegExp("\\\\", 'g'), "/");
				if(APIProxyHelper.existsResource(`${args.resourceName}`)) {
					let resource = {
						type: args.resourceName.split("://")[0],
						name: args.resourceName.split("://")[1]
					};
					if(resource.type == 'node' && global.prefs.node.zip) await Resource.processResourceNodeZip('update',resource.type, resource.name);
					else await Resource.processResource('update',resource.type, resource.name);
				} else 
					global.output.error(`Resource ${args.resourceName} doesn't exists!!`);
			} catch(e) {
				global.output.error(e);
			} finally {
				callback();
			}
		});
	}

	static async processResource(type, typeResource, resourceName) {
		let body = "";
		if(fs.existsSync(`./${global.actualRevision}/apiproxy/resources/${typeResource}/${resourceName}`))
			body = fs.readFileSync(`./${global.actualRevision}/apiproxy/resources/${typeResource}/${resourceName}`, 'utf8');
		let info = APIProxyHelper.getInfo();
		let response = await ApiProxyRest[`${type}Resource`]({name: info.name, revision: info.revision, body: body, resourceName: resourceName, resourceType: typeResource}, global.prefs.apigee);	

		let apiProxyNameWithColor = global.chalk.yellow(info.name); 
		let resourceNameWithColor = global.chalk.yellow(`${resourceName} (${typeResource})`);
		global.output.success(`Resource ${resourceNameWithColor} was ${type}d in APIProxy ${apiProxyNameWithColor}`);
	}

	static async processResourceNodeZip(type, typeResource, resourceName) {
		let body = "";
		let zipFile = "";
		global.watcher.unwatch('apiproxy');
		if(fs.existsSync(`./${global.actualRevision}/apiproxy/resources/${typeResource}/${resourceName}`)) {
			let start = (resourceName.startsWith("/")) ? 1 : 0;
			let folder = resourceName.substr(start, resourceName.indexOf('/'));
			zipFile = `./${global.actualRevision}/apiproxy/resources/${typeResource}/${folder}.zip`;

			await Zipper.compress(`./${global.actualRevision}/apiproxy/resources/${typeResource}/${folder}/`, zipFile);

			body = fs.readFileSync(zipFile);

			let info = APIProxyHelper.getInfo();
			let response = await ApiProxyRest[`${type}Resource`]({name: info.name, revision: info.revision, body: body, resourceName: `${folder}.zip`, resourceType: typeResource}, global.prefs.apigee);
			
			if(fs.existsSync(zipFile)) fs.unlinkSync(zipFile);

			/*
			var spinner = new Spinner(`Get all apiproxy information from apigee.com... `);
			spinner.start();

			let deploymentsInfo = await ApiProxyRest.getDeployments({name: info.name}, global.prefs.apigee);
			let enviromentIndex = _.findIndex(deploymentsInfo['environment'], (item) => item.name == result.environment);
			let oldRevision = _.get(deploymentsInfo['environment'][enviromentIndex], 'revision[0].name');

			await ApiProxyRest.setUndeploy({name: info.name, revision: oldRevision, environment: result.environment}, global.prefs.apigee);

			spinner.message(`Deploy ${info.name}'s revision #${result.revision} to ${result.environment} in apigee.com... `);
			spinner.start();
			await ApiProxyRest.setDeploy({name: info.name, revision: global.actualRevision, environment: result.environment}, global.prefs.apigee);
			spinner.stop();
			*/

			let apiProxyNameWithColor = global.chalk.yellow(info.name); 
			let resourceNameWithColor = global.chalk.yellow(`${resourceName} (${typeResource})`);
			
			global.output.success(`Resource ${resourceNameWithColor} was ${type}d (Zip) in APIProxy ${apiProxyNameWithColor}`);
		} else {
			global.output.error(`Can't update ${resourceNameWithColor} (Zip) in APIProxy ${apiProxyNameWithColor}, because doesn't exists`)
		}
		global.watcher.add('apiproxy', `./${global.actualRevision}/apiproxy/`);
	}
}

module.exports = Resource;