const fs = require("fs-plus");
const SwaggerParser = require('swagger-parser');
const ApiProxyRest = require('../classes/apigee/ApiProxyRest');
const zipper = require('zip-local');
const Cache = require('../classes/core/Cache');
const CLI = require("clui");
const Spinner = CLI.Spinner;
const rimraf = require("rimraf");

class Download {
	static injectCommand(vorpal) {
		vorpal
		.command('download <apiproxyName> <revisionNumber>', 'Download apiproxy from apigee.com')
		.action(function(args, callback) {
			Download.verifyApigeeData(this, () => {
				rimraf.sync("./apiproxy/");
				let zipFile = "./"+ args.apiproxyName +"_revision_"+ args.revisionNumber +".zip";

				let countdown = new Spinner(global.chalk.blue('Downloading \''+ args.apiproxyName +'\' revision '+ args.revisionNumber +' from apigee.com...  '), ['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷']);
				countdown.start();

				ApiProxyRest.export({name: args.apiproxyName, revision: args.revisionNumber, path: zipFile}, global.prefs.apigee, (error) => {
					if(!error) {
						zipper.sync.unzip(zipFile).save("./");
						fs.unlinkSync(zipFile);
						Cache.load("./apiproxy/");
						countdown.stop();
						console.log(global.chalk.green("Apiproxy was downloaded!"));
						callback();
					} else {
						console.log(global.chalk.red("Can't download '"+ zipFile +"'"));
						countdown.stop();
						callback();
					}
				});
			});
		});
	}

	static verifyApigeeData(vorpal, callback) {
		if(!global.prefs.apigee) {
			let validation = (value) => value != '';
			let questions = [];
			questions.push({type: 'input', name: 'organization', message: 'Organization\'s name: ', validate: validation});
			questions.push({type: 'input', name: 'username', message: 'Username: ', validate: validation});
			questions.push({type: 'password', name: 'password', message: 'Password: ', validate: validation});
			vorpal.prompt(questions, (result) => {
				global.prefs.apigee = {organization: result.organization, username: result.username, password: result.password};
				callback();
			});
		} else {
			callback();	
		}
	}
}

module.exports = Download;