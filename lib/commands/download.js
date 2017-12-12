const vorpal = require('vorpal')();
const chalk = vorpal.chalk;
const fs = require("fs-plus");
const SwaggerParser = require('swagger-parser');
const ApiProxyRest = require('../classes/apigee/ApiProxyRest');
const zipper = require('zip-local');


class Download {
	static injectCommand(vorpal) {
		vorpal
		.command('download <apiproxyName> <revisionNumber>', 'Download apiproxy from apigee.com')
		.action(function(args, callback) {
			Download.verifyApigeeData(this, () => {
				let zipFile = "./"+ args.apiproxyName +"_revision_"+ args.revisionNumber +".zip";
				ApiProxyRest.export({name: args.apiproxyName, revision: args.revisionNumber, path: zipFile}, global.prefs.apigee, (error) => {
					if(error === null) {
						zipper.sync.unzip(zipFile).save("./");
						fs.unlinkSync(zipFile);
						console.log(chalk.green("Apiproxy was downloaded!"));
						callback();
					} else {
						console.log(chalk.red("Can't download '"+ zipFile +"'"));
						callback();
					}
				});
			});
		});
	}

	static verifyApigeeData(vorpal, callback) {
		if(typeof global.prefs.apigee === 'undefined') {
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