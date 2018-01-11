const fs = require("fs-plus");
const fromXML = require("from-xml").fromXML;
const toXML = require("to-xml").toXML;
const _ = require("lodash");
const Command = require("../classes/core/Command");
const openInEditor = require('open-in-editor');
const FlowDrawer = require("../classes/drawer/Flow.js");
const Autocomplete = require("../classes/core/helpers/Autocomplete");
const ProxyEndpointHelper = require("../classes/core/helpers/ProxyEndpoint");

class Flow {
	static injectCommand(vorpal) {
		vorpal
		.command('flow <flowName>', 'Show the flow')
		.autocomplete(Autocomplete.getFlowsByProxyEndpoint(vorpal))
		.option('-p, --proxyEndpoint <proxyEndpointName>', 'ProxyEndpoint Name of the flow', Autocomplete.getProxyEndpoints())
		.action(function(args, callback) {
			try {
				let proxyEndpoint = new ProxyEndpointHelper(args.options.proxyEndpoint);
			
				global.output.log(FlowDrawer.draw("request", proxyEndpoint.getFlowRequestStepNames(args.flowName)));
				global.output.log(FlowDrawer.draw("response", proxyEndpoint.getFlowResponseStepNames(args.flowName)));
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
		.action(function(args, callback) {
			try {
				let proxyEndpointContent = fs.readFileSync(`./${global.actualRevision}/apiproxy/proxies/${args.options.proxyEndpoint}.xml`, 'utf8');
				let json = fromXML(proxyEndpointContent);
				let content = {};

				for(let index in json.ProxyEndpoint.Flows.Flow) {
					if(json.ProxyEndpoint.Flows.Flow[index]["@name"] == args.flowName) content = json.ProxyEndpoint.Flows.Flow[index];
				}

				let xml = toXML({Flow: content}, null, 2)
				let fileName = `./.tmpWatcher/proxyEndpoint_${args.options.proxyEndpoint}_flow_${args.flowName}.xml`;

				fs.writeFileSync(fileName, xml, { encoding: 'utf8'});

				Command.openFile(this, fileName, callback);
			} catch(e) {
				global.output.error(e);
				callback();
			} 
		});
	}
}

module.exports = Flow;