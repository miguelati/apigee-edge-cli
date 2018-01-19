const fs = require("fs-plus");
//const _ = require("lodash");
const Command = require("../classes/core/Command");
const FlowDrawer = require("../classes/drawer/Flow.js");
const TagFactory = require("../classes/xml/TagFactory");
const APIProxyHelper = require("../classes/core/helpers/APIProxy");
const ProxyEndpointHelper = require("../classes/core/helpers/ProxyEndpoint");
const ApiProxyRest = require("../classes/apigee/ApiProxyRest");
const CLI = require("clui");
const Spinner = CLI.Spinner;
const Autocomplete = require("../classes/core/helpers/Autocomplete");

class ProxyEndpoint {
	static injectCommand(vorpal) {
		vorpal.command('proxyEndpoint <proxyEndpointName>', 'List all ProxyEndpoints')
		.autocomplete(Autocomplete.getProxyEndpoints())
		.action((args, callback) => {
			try {
				let proxyEndpointHelper = new ProxyEndpointHelper(args.proxyEndpointName);
				var rows = [];

				rows.push(["Name", proxyEndpointHelper.getName()]);
				rows.push(["FaultRules", proxyEndpointHelper.getFaultRulesNames().join()]);
				rows.push(["PreFlow Request", proxyEndpointHelper.getPreFlowRequestStepNames().join()]);
				rows.push(["PreFlow Response", proxyEndpointHelper.getPreFlowResponseStepNames().join()]);
				rows.push(["PostFlow Request", proxyEndpointHelper.getPostFlowRequestStepNames().join()]);
				rows.push(["PostFlow Response", proxyEndpointHelper.getPostFlowResponseStepNames().join()]);
				rows.push(["Flows", proxyEndpointHelper.getFlowsNames().join()]);
					
				Command.showHeaderApiproxy();
				Command.showTable([], [30, 70], rows);
			} catch(e) {
				global.output.error(e);
			} finally {
				callback();
			}
		});
		// PreFlow
		vorpal.command('proxyEndpoint preflow <proxyEndpointName>', 'Show preflow graph')
		.autocomplete(Autocomplete.getProxyEndpoints())
		.action((args, callback) => {
			try {
				let proxyEndpointHelper = new ProxyEndpointHelper(args.proxyEndpointName);

				global.output.log(FlowDrawer.draw("request", proxyEndpointHelper.getPreFlowRequestStep()));
				global.output.log(FlowDrawer.draw("response", proxyEndpointHelper.getPreFlowResponseStep()));
			} catch(e) {
				global.output.error(e);
			} finally {
				callback();
			}
		});
		// PostFlow
		vorpal.command('proxyEndpoint postflow <proxyEndpointName>', 'Show postflow graph')
		.autocomplete(Autocomplete.getProxyEndpoints())
		.action((args, callback) => {
			try {
				let proxyEndpointHelper = new ProxyEndpointHelper(args.proxyEndpointName);

				global.output.log(FlowDrawer.draw("request", proxyEndpointHelper.getPostFlowRequestStep()));
				global.output.log(FlowDrawer.draw("response", proxyEndpointHelper.getPostFlowResponseStepexit()));
			} catch(e) {
				global.output.error(e);
			} finally {
				callback();	
			}
		});
		// Create
		vorpal.command('proxyEndpoint create <proxyEndpointName>', 'Create new Proxy Endpoint')
		.option("-e, --enviroment <env>", "Name of enviroment to request list virtual hosts", ["test", "prod"])
		.action((args, callback) => {
			try {
				if(APIProxyHelper.existsProxyEndpoint(args.proxyEndpointName)) {
					global.output.error("ProxyEndpoint exists!!");
					callback();
				} else {
					let newVorpal = vorpal.activeCommand;
					let env = (args.options.enviroment) ? args.options.enviroment : "test";
					let countdown = new Spinner(global.chalk.blue('Get Virtuals Hosts in Enviroment \''+ env +'\' from apigee.com...  '), ['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷']);
					countdown.start();

					ApiProxyRest.getVirtualHosts({env: env}, global.prefs.apigee, function(error, response, body){
						countdown.stop();
						let vhosts = (error) ? ['default', 'secure'] : JSON.parse(body);

						let questions = [
							{type: 'input', name: 'basePath', message: 'Enter the basepath:'},
							{type: 'checkbox', name: 'vhosts', message: 'Select the Virtual Hosts:', choices: vhosts},
						];

						newVorpal.prompt(questions, (result) => {
							let proxyEndpoint = new TagFactory("ProxyEndpoint");
							proxyEndpoint.createEmpty(args.proxyEndpointName, result.basePath, result.vhosts);
							
							APIProxyHelper.addProxyEndpoint(args.proxyEndpointName);

							fs.writeFileSync(`./${global.actualRevision}/apiproxy/proxies/${args.proxyEndpointName}.xml`, proxyEndpoint.toXml(), { encoding: 'utf8'});

							global.output.success(`ProxyEndpoint ${args.proxyEndpointName} was created.`);
							callback();
						});
					});
					
				}
			} catch(e) {
				global.output.error(e);
				callback();
			}
		});
	}
}

module.exports = ProxyEndpoint;