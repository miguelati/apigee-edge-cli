const fs = require("fs-plus");
const SwaggerParser = require('swagger-parser');
const ApiProxyRest = require('../classes/apigee/ApiProxyRest');
const zipper = require('zip-local');
const CLI = require("clui");
const Spinner = CLI.Spinner;
const rimraf = require("rimraf");
const Command = require("../classes/core/Command");
const APIProxyHelper = require("../classes/core/helpers/APIProxy");
const path = require("path");

class Download {
	static injectCommand(vorpal) {
		vorpal
		.command('download <apiproxyName> [revisionNumber]', 'Download apiproxy from apigee.com')
		.option('-o, --organizationPath', 'Path \'<organization>/<apiproxyName>\' structure to unzip')
		.action(function(args, callback) {
			Command.getApigeeData(this, async ()=> {
				rimraf.sync("./apiproxy/");
				
				
				let countdown = new Spinner(global.chalk.blue(`Get all revisions number to verify from apigee.com... `), ['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷']);
				countdown.start();

				let allRevisions = await ApiProxyRest.getRevisions({apiproxyName: args.apiproxyName}, global.prefs.apigee);
				if(args.revisionNumber === undefined || allRevisions.indexOf(args.revisionNumber) === -1) {
					args.revisionNumber = parseInt(allRevisions[allRevisions.length - 1]);
				}
				
				let zipFile = "./"+ args.apiproxyName +"_revision_"+ args.revisionNumber +".zip";
				countdown.message(global.chalk.blue(`Downloading \'${args.apiproxyName}\' revision ${args.revisionNumber} from apigee.com... `))

				ApiProxyRest.export({name: args.apiproxyName, revision: args.revisionNumber, path: zipFile}, global.prefs.apigee, (error) => {
					if(!error) {
						if(args.options.organizationPath) {
							fs.makeTreeSync(`./${global.prefs.apigee.organization}/${args.apiproxyName}/`);
							zipper.sync.unzip(zipFile).save(`./${global.prefs.apigee.organization}/${args.apiproxyName}/`);
						} else {
							zipper.sync.unzip(zipFile).save("./");
						}
						fs.unlinkSync(zipFile);
						countdown.stop();
						vorpal.delimiter((fs.existsSync("./apiproxy")) ? global.chalk.green(APIProxyHelper.getInfo().name + "$") : 'edge$')
						global.output.success("Apiproxy was downloaded!");
						callback();
					} else {
						countdown.stop();
						global.output.error("Can't download '"+ zipFile +"'");
						callback();
					}
				});
			});
		});
	}
}

module.exports = Download;