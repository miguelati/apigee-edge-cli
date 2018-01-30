const fs = require("fs-plus");
const _ = require("lodash");
const Command = require("../classes/core/Command");
const FlowDrawer = require("../classes/drawer/Flow.js");
const TagFactory = require("../classes/xml/TagFactory");
const APIProxyHelper = require("../classes/core/helpers/APIProxy");
const ProxyEndpointHelper = require("../classes/core/helpers/ProxyEndpoint");
const ApiProxyRest = require("../classes/apigee/ApiProxyRest");
const CLI = require("clui");
const Spinner = CLI.Spinner;
const Autocomplete = require("../classes/core/helpers/Autocomplete");
const Prompt = require('../classes/core/ui/Prompt');

class ProxyEndpoint {
	static injectCommand(vorpal) {
		vorpal
		.command('proxyEndpoint open <proxyEndpointName>', 'Open the ProxyEndpoint file')
		.autocomplete(Autocomplete.getProxyEndpoints())
		.action(async (args, callback) => {
			try {
				if(APIProxyHelper.existsProxyEndpoint(args.proxyEndpointName)) await Command.openFile(`./${global.actualRevision}/apiproxy/proxies/${args.proxyEndpointName}.xml`);
				else throw `ProxyEndpoint ${args.proxyEndpointName} doesn't exists!!`;
			} catch(e) {
				global.output.error(e);
			} finally {
				callback();
			}
		});

		vorpal
		.command('proxyEndpoint info <proxyEndpointName>', 'List all ProxyEndpoints')
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
		
		vorpal
		.command('proxyEndpoint list <proxyEndpointName>', 'List all ProxyEndpoints')
		.autocomplete(Autocomplete.getProxyEndpoints())
		.action((args, callback) => {
			try {
				let proxyEndpointHelper = new ProxyEndpointHelper(args.proxyEndpointName);
				let flows = proxyEndpointHelper.getFlows();
				let rows = [];

				for(let index in flows) {
					//console.log(flows[index]);
					rows.push([Command.analizeVerbInCondition(flows[index].condition || ""), Command.analizePathInCondition(flows[index].condition || ""), flows[index].name]);
				}
					
				Command.showHeaderApiproxy();
				Command.showTable([], [30, 30, 40], rows);
			} catch(e) {
				global.output.error(e);
			} finally {
				callback();
			}
		});

		// PreFlow
		vorpal
		.command('proxyEndpoint preflow <proxyEndpointName>', 'Show preflow graph')
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
		vorpal
		.command('proxyEndpoint postflow <proxyEndpointName>', 'Show postflow graph')
		.autocomplete(Autocomplete.getProxyEndpoints())
		.action((args, callback) => {
			try {
				let proxyEndpointHelper = new ProxyEndpointHelper(args.proxyEndpointName);

				global.output.log(FlowDrawer.draw("request", proxyEndpointHelper.getPostFlowRequestStep()));
				global.output.log(FlowDrawer.draw("response", proxyEndpointHelper.getPostFlowResponseStep()));
			} catch(e) {
				global.output.error(e);
			} finally {
				callback();	
			}
		});

		// Create
		vorpal
		.command('proxyEndpoint create <proxyEndpointName>', 'Create new Proxy Endpoint')
		.autocomplete(Autocomplete.getProxyEndpoints())
		.option("-e, --enviroment <env>", "Name of enviroment to request list virtual hosts", ["test", "prod"])
		.action(async (args, callback) => {
			try {
				if(APIProxyHelper.existsProxyEndpoint(args.proxyEndpointName)) {
					global.output.error("ProxyEndpoint exists!!");
					callback();
				} else {
					let env = (args.options.enviroment) ? args.options.enviroment : "test";
					let countdown = new Spinner(global.chalk.blue('Get Virtuals Hosts in Enviroment \''+ env +'\' from apigee.com...  '), ['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷']);
					countdown.start();

					let response = await ApiProxyRest.getVirtualHosts({env: env}, global.prefs.apigee);
						
					countdown.stop();

					let vhosts = JSON.parse(response);
					let prompt = new Prompt();
					prompt.input('basePath', 'Enter the basepath:');
					prompt.check('vhosts', 'Select the Virtual Hosts:', vhosts);
					let result = await prompt.show();
					
					let proxyEndpoint = new TagFactory("ProxyEndpoint");
					proxyEndpoint.createEmpty(args.proxyEndpointName, result.basePath, result.vhosts);

					//APIProxyHelper.addProxyEndpoint(args.proxyEndpointName);

					fs.writeFileSync(`./${global.actualRevision}/apiproxy/proxies/${args.proxyEndpointName}.xml`, proxyEndpoint.toXml(), { encoding: 'utf8'});

					global.output.success(`ProxyEndpoint ${args.proxyEndpointName} was created.`);
					callback();
				}
			} catch(e) {
				global.output.error(e);
				callback();
			}
		});

		vorpal
		.command('proxyEndpoint move <proxyEndpointName>', 'Show postflow graph')
		.autocomplete(Autocomplete.getProxyEndpoints())
		.action(async (args, callback) => {
			try {
				let proxyEndpointHelper = new ProxyEndpointHelper(args.proxyEndpointName);
				let choices = proxyEndpointHelper.getFlowsNames();
				if(choices.length < 2) throw `In Proxy Endpoint ${args.proxyEndpointName} may be 2 or more flows`;

				let choicesFun = (result) => {
					if(result !== null && result.to_move) _.remove(choices, (o) => o == result.to_move);
					return choices;
				};

				let prompt = new Prompt();
				prompt.list('to_move', 'Select a flow to move:', choicesFun);
				prompt.selectLine('index', 'Select the order', choicesFun, {placeholder: 'MOVE HERE'});

				let result = await prompt.show();

				proxyEndpointHelper.moveFlow(result.to_move, result.index);

				global.output.success(`In ProxyEndpoint ${args.proxyEndpointName} the flow ${result.to_move} was moved to ${result.index} position `);
			} catch(e) {
				global.output.error(e);
			} finally {
				callback();	
			}
		});

	}
}

module.exports = ProxyEndpoint;