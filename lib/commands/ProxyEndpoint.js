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
				Command.showTable([], [30, 70], rows)

				callback();
		   
		});

		vorpal.command('proxyEndpoint preflow <proxyEndpointName>', 'Show preflow graph')
			.autocomplete(Autocomplete.getProxyEndpoints())
			.action((args, callback) => {
		    
				let proxyEndpointHelper = new ProxyEndpointHelper(args.proxyEndpointName);

				global.output.log(FlowDrawer.draw("request", proxyEndpointHelper.getPreFlowRequestStepNames()));
				global.output.log(FlowDrawer.draw("response", proxyEndpointHelper.getPreFlowResponseStepNames()));

				callback();
		})

		vorpal.command('proxyEndpoint postflow <proxyEndpointName>', 'Show postflow graph')
			.autocomplete(Autocomplete.getProxyEndpoints())
			.action((args, callback) => {

				let proxyEndpointHelper = new ProxyEndpointHelper(args.proxyEndpointName);
		    
		    	global.output.log(FlowDrawer.draw("request", proxyEndpointHelper.getPostFlowRequestStepNames()));
		    	global.output.log(FlowDrawer.draw("response", proxyEndpointHelper.getPostFlowResponseStepNames()));

		    	callback();
		    
		});

		vorpal.command('proxyEndpoint create <proxyEndpointName>', 'Create new Proxy Endpoint')
		.option("-e, --enviroment <env>", "Name of enviroment to request list virtual hosts", ["test", "prod"])
		.action(function(args, callback) {
			if(APIProxyHelper.existsProxyEndpoint(args.proxyEndpointName)) {
				global.output.error("ProxyEndpoint exists!!");
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
		});
	}
}

module.exports = ProxyEndpoint;