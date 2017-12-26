const fs = require("fs-plus");
const SwaggerParser = require('swagger-parser');
const fromXML = require("from-xml").fromXML;
const Table = require('cli-table2');
const _ = require("lodash");
const Command = require("../classes/core/Command");

const Autocomplete = require("../classes/core/helpers/Autocomplete");

class Policy {
	static injectCommand(vorpal) {
		vorpal
		.command('policy <policyName>', 'Open policy xml')
		.autocomplete(() => Autocomplete.getPolicies())
		.action(function(args, callback) {

			Command.openFile(`./apiproxy/policies/${args.policyName}.xml`, callback)

		});

		vorpal
		.command('policy create <policyName>', 'Create a new Policy')
		.action(function(args, callback) {

			if(APIProxyHelper.existsPolicy(args.policyName)) {
				global.output.error("Policiy exists!!");
				callback();
			} else {
				let newVorpal = this;
				let env = (args.options.enviroment) ? args.options.enviroment : "test";
				let countdown = new Spinner(global.chalk.blue('Get Virtuals Hosts in Enviroment \''+ env +'\' from apigee.com...  '), ['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷']);
				countdown.start();

				ApiProxyRest.getVirtualHosts({env: "prod"}, global.prefs.apigee, function(error, response, body){
					countdown.stop();
					let vhosts = (error) ? ['default', 'secure'] : JSON.parse(body);

					let questions = [
						{type: 'input', name: 'basePath', message: 'Enter the basepath:'},
						{type: 'checkbox', name: 'vhosts', message: 'Select the Virtual Hosts:', choices: vhosts},
					];

					newVorpal.prompt(questions, function(result){
						let proxyEndpoint = new TagFactory("ProxyEndpoint");
						proxyEndpoint.createEmpty(args.proxyEndpointName, result.basePath, result.vhosts);
						
						APIProxyHelper.addProxyEndpoint(args.proxyEndpointName);

						fs.writeFileSync(`./apiproxy/proxies/${args.proxyEndpointName}.xml`, proxyEndpoint.toXml(), { encoding: 'utf8'});

						global.output.success(`ProxyEndpoint ${args.targetEndpointName} was created.`);
						callback();
					});
				});
			}



			Policy.verifyEditor(this, (editorName) => {
				let editor = openInEditor.configure({
				  editor: editorName
				}, function(err) {
				  console.error('Something went wrong: ' + err);
				});

				editor.open('./apiproxy/policies/'+ args.policyName +'.xml:0:0')
				.then(function() {
					global.output.success(`./apiproxy/policies/${args.policyName}.xml was opened!`)
					console.log(global.chalk.green(''));
					callback();
				}, function(err) {
					global.output.error(`Something went wrong: ${err}`);
					callback();
				});
			});
		});
	}
}

module.exports = Policy;