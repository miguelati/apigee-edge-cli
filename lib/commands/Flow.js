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
		.command('flow', 'Show the flow')
		.action(async (args, callback) => {
			try {

				let choices = (result) => {
					let proxyEndpoint = new ProxyEndpointHelper(result.proxyEndpointName);
					return proxyEndpoint.getFlowsNames();
				};

				let prompt = new Prompt();
				prompt.list('proxyEndpointName', 'Select a Proxy Endpoint:', APIProxyHelper.getProxyEndpoints());
				prompt.list('flowName', 'Select a Flow:', choices);

				let result = await prompt.show();
				let proxyEndpoint = new ProxyEndpointHelper(result.proxyEndpointName);
				
				global.output.log(FlowDrawer.draw("request", proxyEndpoint.getFlowRequestStep(result.flowName)));
				global.output.log(FlowDrawer.draw("response", proxyEndpoint.getFlowResponseStep(result.flowName)));
			} catch(e) {
				global.output.error(e);
			} finally {
				callback();
			}
		});

		vorpal
		.command('flow edit', 'Show the flow')
		.action(async (args, callback) => {
			try {
				let choices = (result) => {
					let proxyEndpointHelper = new ProxyEndpointHelper(result.proxyEndpointName);
					return proxyEndpointHelper.getFlowsNames();
				};

				let prompt = new Prompt();
				prompt.list('proxyEndpointName', 'Select a Proxy Endpoint:', APIProxyHelper.getProxyEndpoints());
				prompt.list('flowName', 'Select a Flow to edit', choices);

				let result = await prompt.show();

				let proxyEndpointContent = fs.readFileSync(`./${global.actualRevision}/apiproxy/proxies/${result.proxyEndpointName}.xml`, 'utf8');
				let json = fromXML(proxyEndpointContent);
				let content = {};

				for(let index in json.ProxyEndpoint.Flows.Flow) 
					if(json.ProxyEndpoint.Flows.Flow[index]["@name"] == result.flowName) content = json.ProxyEndpoint.Flows.Flow[index];

				let xml = toXML({Flow: content}, null, 2)
				let fileName = `./.tmpWatcher/edit_proxyEndpoint_${result.proxyEndpointName}_flow_${result.flowName}.xml`;

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
		.command('flow move', 'Move step\'s order in flow')
		.action(async (args, callback) => {
			try {
				let choices = (result) => {
					let proxyEndpointHelper = new ProxyEndpointHelper(result.proxyEndpointName);
					return proxyEndpointHelper.getFlowsNames();
				};

				let prompt = new Prompt();
				prompt.list('proxyEndpointName', 'Select a Proxy Endpoint:', APIProxyHelper.getProxyEndpoints());
				prompt.list('flowName', 'Select a Flow to edit:', choices);
				prompt.list('type', 'Select one:', ['Request', 'Response']);
				
				let choicesSteps = (result) => {
					let proxyEndpointHelper = new ProxyEndpointHelper(result.proxyEndpointName);

					let steps = "";
					if(result.type == "Request") steps = proxyEndpointHelper.getFlowRequestStepNames(result.flowName);
					else steps = proxyEndpointHelper.getFlowResponseStepNames(result.flowName);

					if(result !== null && result.to_move) _.remove(steps, (o) => o == result.to_move);
					return steps;
				};

				prompt.list('to_move', 'Select a flow to move:', choicesSteps);
				prompt.selectLine('index', 'Select the order', choicesSteps, {placeholder: "MOVE HERE"});

				let result = await prompt.show();

				let proxyEndpointHelper = new ProxyEndpointHelper(result.proxyEndpointName);
				proxyEndpointHelper.moveStep(result.flowName, result.to_move, result.type, result.index);

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