const fs = require("fs-plus");
const fromXML = require("from-xml").fromXML;
const toXML = require("to-xml").toXML;
const _ = require("lodash");
const Command = require("../classes/core/Command");
const openInEditor = require('open-in-editor');
const FlowDrawer = require("../classes/drawer/Flow.js");
const Autocomplete = require("../classes/core/helpers/Autocomplete");

class Flow {
	static injectCommand(vorpal) {
		vorpal
		.command('flow <flowName>', 'Show the flow')
		.autocomplete({
			data: (input, callback) => Autocomplete.getFlowsByProxyEndpoint(vorpal.ui.input(), input, callback)
		})
		.option('-p, --proxyEndpoint <proxyEndpointName>', 'ProxyEndpoint Name of the flow', () => Autocomplete.getProxyEndpoints())
		.action(function(args, callback) {
			let requestAux = Command.getObject(global.localStorage.getItem(`proxy.${args.options.proxyEndpoint}.flows.${args.flowName}.request`));
			let request = Command.verifyArray(requestAux);

			let responseAux = Command.getObject(global.localStorage.getItem(`proxy.${args.options.proxyEndpoint}.flows.${args.flowName}.response`));
			let response = Command.verifyArray(responseAux);

			console.log(FlowDrawer.draw("request", request.map((item) => item.name)));
			console.log(FlowDrawer.draw("response", response.map((item) => item.name)));
  			
			callback();
		});

		vorpal
		.command('flow edit <flowName>', 'Show the flow')
		.autocomplete({
			data: (input, callback) => Autocomplete.getFlowsByProxyEndpoint(vorpal.ui.input(), input, callback)
		})
		.option('-p, --proxyEndpoint <proxyEndpointName>', 'ProxyEndpoint Name of the flow', () => Autocomplete.getProxyEndpoints())
		.action(function(args, callback) {
			let proxyEndpointContent = fs.readFileSync(`./apiproxy/proxies/${args.options.proxyEndpoint}.xml`, 'utf8');
			let json = fromXML(proxyEndpointContent);
			let content = {};

			for(let index in json.ProxyEndpoint.Flows.Flow) {
				if(json.ProxyEndpoint.Flows.Flow[index]["@name"] == args.flowName) content = json.ProxyEndpoint.Flows.Flow[index];
			}

			let xml = toXML({Flow: content}, null, 2)
			let fileName = `./.tmpWatcher/proxyEndpoint_${args.options.proxyEndpoint}_flow_${args.flowName}.xml`;

			fs.writeFileSync(fileName, xml, { encoding: 'utf8'});

			Command.openFile(fileName, callback);
		});
	}
}

module.exports = Flow;