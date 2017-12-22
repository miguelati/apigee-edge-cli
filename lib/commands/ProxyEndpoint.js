const fs = require("fs-plus");
const SwaggerParser = require('swagger-parser');
const fromXML = require("from-xml").fromXML;
const Table = require('cli-table2');
const _ = require("lodash");
const Command = require("../classes/core/Command");
const FlowDrawer = require("../classes/drawer/Flow.js");
const TagFactory = require("../classes/xml/TagFactory");
const APIProxyHelper = require("../classes/core/helpers/APIProxy");
const ApiProxyRest = require("../classes/apigee/ApiProxyRest");
const CLI = require("clui");
const Spinner = CLI.Spinner;

class ProxyEndpoint {
	static injectCommand(vorpal) {
		vorpal.command('proxyEndpoint <proxyEndpointName>', 'List all ProxyEndpoints')
			.autocomplete({
				data: function () {
					let autocomplete = Command.getObject(global.localStorage.getItem('apiproxy.proxyEndpoints'));
					let result = Command.verifyArray(autocomplete);
					return result.map((item) => (item.indexOf(" ") === -1) ? item : `"${item}"`);
				}
			})
			.action((args, callback) => {
		    if (vorpal.localStorage.getItem('apiproxy.name')) {
		    	var rows = [];

		    	rows.push(["Name", global.localStorage.getItem('proxy.'+ args.proxyEndpointName +'.name')]);
		    	
		    	// FaultRules
		    	let faultRules = Command.getObject(global.localStorage.getItem('proxy.'+ args.proxyEndpointName +'.faultRules.nameFaultRules'));
		    	rows.push(["FaultRules", Command.showArray(faultRules)]);

		    	// PreFlow
		    	let PreFlowRequest =  Command.getObject(global.localStorage.getItem('proxy.'+ args.proxyEndpointName +'.preflow.request'));
		    	rows.push(["PreFlow Request", Command.showArray(Command.getArray(PreFlowRequest, 'name'))]);

		    	let PreFlowResponse = Command.getObject(global.localStorage.getItem('proxy.'+ args.proxyEndpointName +'.preflow.response'));
		    	rows.push(["PreFlow Response", Command.showArray(Command.getArray(PreFlowResponse, 'name'))]);
		    	
		    	// PostFlow
		    	let PostFlowRequest = Command.getObject(global.localStorage.getItem('proxy.'+ args.proxyEndpointName +'.postflow.request'));
		    	rows.push(["PostFlow", Command.showArray(Command.getArray(PostFlowRequest, 'name'))]);

		    	let PostFlowResponse = Command.getObject(global.localStorage.getItem('proxy.'+ args.proxyEndpointName +'.postflow.response'));
		    	rows.push(["PostFlow", Command.showArray(Command.getArray(PostFlowResponse, 'name'))]);

		    	// Flows
		    	let flows = Command.getObject(global.localStorage.getItem('proxy.'+ args.proxyEndpointName +'.flows.nameFlows'));
		    	rows.push(["Flows", Command.showArray(flows)]);
		    	
		    	Command.showHeaderApiproxy();
		    	Command.showTable([], [50, 100], rows)

		    	callback();
		    } else {
		    	vorpal.log(global.chalk.red("Apiproxy xml doesn't exists!"));
		    	callback();
		    }
		});

		vorpal.command('proxyEndpoint preflow <proxyEndpointName>', 'Show preflow graph')
			.autocomplete({
				data: function () {
					let autocomplete = Command.getObject(global.localStorage.getItem('apiproxy.proxyEndpoints'));
					let result = Command.verifyArray(autocomplete);
					return result.map((item) => (item.indexOf(" ") === -1) ? item : `"${item}"`);
				}
			})
			.action((args, callback) => {
		    if (vorpal.localStorage.getItem('apiproxy.name')) {
		    	let requestAux = Command.getObject(global.localStorage.getItem(`proxy.${args.proxyEndpointName}.preflow.request`));
		    	let request = Command.verifyArray(requestAux);

		    	let responseAux = Command.getObject(global.localStorage.getItem(`proxy.${args.proxyEndpointName}.preflow.response`));
		    	let response = Command.verifyArray(responseAux);

		    	console.log(FlowDrawer.draw("request", request.map((item) => item.name)));
		    	console.log(FlowDrawer.draw("response", response.map((item) => item.name)));

		    	callback();
		    } else {
		    	vorpal.log(global.chalk.red("Apiproxy xml doesn't exists!"));
		    	callback();
		    }
		});

		vorpal.command('proxyEndpoint postflow <proxyEndpointName>', 'Show postflow graph')
			.autocomplete({
				data: function () {
					let autocomplete = Command.getObject(global.localStorage.getItem('apiproxy.proxyEndpoints'));
					let result = Command.verifyArray(autocomplete);
					return result.map((item) => (item.indexOf(" ") === -1) ? item : `"${item}"`);
				}
			})
			.action((args, callback) => {
		    if (vorpal.localStorage.getItem('apiproxy.name')) {
		    	let requestAux = Command.getObject(global.localStorage.getItem(`proxy.${args.proxyEndpointName}.postflow.request`));
		    	let request = Command.verifyArray(requestAux);

		    	let responseAux = Command.getObject(global.localStorage.getItem(`proxy.${args.proxyEndpointName}.postflow.response`));
		    	let response = Command.verifyArray(responseAux);

		    	console.log(FlowDrawer.draw("request", request.map((item) => item.name)));
		    	console.log(FlowDrawer.draw("response", response.map((item) => item.name)));

		    	callback();
		    } else {
		    	vorpal.log(global.chalk.red("Apiproxy xml doesn't exists!"));
		    	callback();
		    }
		});

		vorpal.command('proxyEndpoint create <proxyEndpointName>', 'Create new Proxy Endpoint')
		.option("-e, --enviroment <env>", "Name of enviroment to request list virtual hosts", ["test", "prod"])
		.action(function(args, callback) {
			if(APIProxyHelper.existsProxyEndpoint(args.proxyEndpointName)) {
				console.log(global.chalk.red("ProxyEndpoint exists!!"));
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

						console.log(global.chalk.green(`ProxyEndpoint ${args.targetEndpointName} was created.`));
						callback();
					});
				});
			}
		});
	}
}

module.exports = ProxyEndpoint;