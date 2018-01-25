const fs = require("fs-plus");
const fromXML = require("from-xml").fromXML;
const toXML = require("to-xml").toXML;
const _ = require("lodash");
const Command = require("../classes/core/Command");
const openInEditor = require('open-in-editor');
const FlowDrawer = require("../classes/drawer/Flow.js");
const Autocomplete = require("../classes/core/helpers/Autocomplete");
const Prompt = require("../classes/core/ui/Prompt");
const APIProxyHelper = require("../classes/core/helpers/APIProxy");
const ProxyEndpointHelper = require("../classes/core/helpers/ProxyEndpoint");

class Flow {
	static injectCommand(vorpal) {
		vorpal
		.command('flow <flowName>', 'Show the flow')
		.autocomplete(Autocomplete.getFlowsByProxyEndpoint(vorpal))
		.option('-p, --proxyEndpoint <proxyEndpointName>', 'ProxyEndpoint Name of the flow', Autocomplete.getProxyEndpoints())
		.action((args, callback) => {
			try {
				let proxyEndpoint = new ProxyEndpointHelper(args.options.proxyEndpoint);
				//global.output.log(proxyEndpoint.getFlowRequestStep(args.flowName));
				global.output.log(FlowDrawer.draw("request", proxyEndpoint.getFlowRequestStep(args.flowName)));
				global.output.log(FlowDrawer.draw("response", proxyEndpoint.getFlowResponseStep(args.flowName)));
			} catch(e) {
				global.output.error(e);
			} finally {
				callback();
			}
		});

		vorpal
		.command('flow edit <flowName>', 'Show the flow')
		.autocomplete(Autocomplete.getFlowsByProxyEndpoint(vorpal))
		.option('-p, --proxyEndpoint <proxyEndpointName>', 'ProxyEndpoint Name of the flow', Autocomplete.getProxyEndpoints())
		.action(async (args, callback) => {
			try {
				let proxyEndpointContent = fs.readFileSync(`./${global.actualRevision}/apiproxy/proxies/${args.options.proxyEndpoint}.xml`, 'utf8');
				let json = fromXML(proxyEndpointContent);
				let content = {};

				for(let index in json.ProxyEndpoint.Flows.Flow) 
					if(json.ProxyEndpoint.Flows.Flow[index]["@name"] == args.flowName) content = json.ProxyEndpoint.Flows.Flow[index];

				let xml = toXML({Flow: content}, null, 2)
				let fileName = `./.tmpWatcher/edit_proxyEndpoint_${args.options.proxyEndpoint}_flow_${args.flowName}.xml`;

				fs.writeFileSync(fileName, xml, { encoding: 'utf8'});

				await Command.openFile(fileName);
			} catch(e) {
				global.output.error(e);
			} finally {
				callback();
			}
		});

		vorpal
		.command('flow create [flowName]', 'Show the flow')
		//.autocomplete(Autocomplete.getFlowsByProxyEndpoint(vorpal))
		//.option('-p, --proxyEndpoint <proxyEndpointName>', 'ProxyEndpoint Name of the flow', Autocomplete.getProxyEndpoints())
		.action(async (args, callback) => {
			try {

				let choices = (result) => {
					let proxyEndpointHelper = new ProxyEndpointHelper(result.proxyEndpointName);
					return proxyEndpointHelper.getFlowsNames();
				};

				let prompt = new Prompt();
				prompt.list('proxyEndpointName', 'Select a Proxy Endpoint:', APIProxyHelper.getProxyEndpoints());
				if(_.isEmpty(args.flowName)) prompt.input('name', 'Enter nam\'s flow');
				prompt.selectLine('index', 'Select the order', choices, {placeholder: "INSERT HERE"});

				let result = await prompt.show();

				let xml = toXML({Flow: {'@name': args.flowName || result.name, "Description" : "", "Request" : "", "Response" : ""}}, null, 2);
				let fileName = `./.tmpWatcher/create_proxyEndpoint_${result.proxyEndpointName}_flow_${args.flowName || result.name}_index_${result.index}.xml`;
				fs.writeFileSync(fileName, xml, { encoding: 'utf8'});

				await Command.openFile(fileName,"2:16");
			} catch(e) {
				global.output.error(e);
			} finally {
				callback();
			}
		});

		vorpal
		.command('flow move <flowName>', 'Move step\'s order in flow')
		.autocomplete(Autocomplete.getFlowsByProxyEndpoint(vorpal))
		.option('-req, --request', 'Select a Steps of request')
		.option('-res, --response', 'Select a Steps of response')
		.option('-p, --proxyEndpoint <proxyEndpointName>', 'ProxyEndpoint Name of the flow', Autocomplete.getProxyEndpoints())
		.action(async (args, callback) => {
			try {
				let type = "";
				if(args.options.request && args.options.response) throw "Error: Only request or only response";
				else if(args.options.request && !args.options.response) type = "Request";
				else if(!args.options.request && args.options.response) type = "Response";
				else throw "Error: Need to set request or response";

				let proxyEndpointHelper = new ProxyEndpointHelper(args.options.proxyEndpoint);

				let steps = "";
				if(type == "Request") steps = proxyEndpointHelper.getFlowRequestStepNames(args.flowName);
				else steps = proxyEndpointHelper.getFlowResponseStepNames(args.flowName);
				
				let choicesFun = (result) => {
					if(result !== null && result.to_move) _.remove(steps, (o) => o == result.to_move);
					return steps;
				};

				let prompt = new Prompt();
				prompt.list('to_move', 'Select a flow to move:', choicesFun);
				prompt.selectLine('index', 'Select the order', choicesFun, {placeholder: "MOVE HERE"});

				let result = await prompt.show();

				proxyEndpointHelper.moveStep(args.flowName, result.to_move, type, result.index);

				global.output.success(`Step ${result.to_move} was moved to ${result.index} position in ProxyEndpoint ${args.options.proxyEndpoint} Flow ${args.flowName}`);
			} catch(e) {
				global.output.error(e);
			} finally {
				callback();
			}
		});
	}
}

module.exports = Flow;