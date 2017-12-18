const fs = require("fs-plus");
const SwaggerParser = require('swagger-parser');
const fromXML = require("from-xml").fromXML;
const Table = require('cli-table2');
const _ = require("lodash");
const Command = require("../classes/core/Command");
const openInEditor = require('open-in-editor');
const FlowDrawer = require("../classes/drawer/Flow.js");

class Flow {
	static injectCommand(vorpal) {
		vorpal
		.command('flow <flowName>', 'Show the flow')
		.autocomplete({
			data: function (input, callback) {
				let only = vorpal.ui.input();
				if(only.match(/(\-p |\-\-proxyEndpoint )([0-9A-Za-z]+) /g) === null) {
					callback([]);
				} else {
					let match = only.match(/^flow --proxyEndpoint (\w+) (\w*)/);
					if(input.indexOf(" ") === -1) {
						let autocomplete = Command.getObject(global.localStorage.getItem(`proxy.${match[1]}.flows.nameFlows`));
						let tmpResult = Command.verifyArray(autocomplete);
						let result = tmpResult.map((item) => (item.indexOf(" ") === -1) ? item : `"${item}"`);
						if(!_.isUndefined(match[2]) && result.indexOf(match[2]) > -1) {
							callback([]);
						} else {
							callback(result);		
						}
					} else {
						callback([]);
					}
				}
			}
		})
		.option('-p, --proxyEndpoint <proxyEndpointName>', 'ProxyEndpoint Name of the flow', function(){
			let autocomplete = Command.getObject(global.localStorage.getItem('apiproxy.proxyEndpoints'));
			let result = Command.verifyArray(autocomplete);
			return result.map((item) => (item.indexOf(" ") === -1) ? item : `"${item}"`);
		})
		.action(function(args, callback) {
			let requestAux = Command.getObject(global.localStorage.getItem(`proxy.${args.options.proxyEndpoint}.flows.${args.flowName}.request`));
			let request = Command.verifyArray(requestAux);

			let responseAux = Command.getObject(global.localStorage.getItem(`proxy.${args.options.proxyEndpoint}.flows.${args.flowName}.response`));
			let response = Command.verifyArray(responseAux);

			console.log(FlowDrawer.draw("request", request.map((item) => item.name)));
			console.log(FlowDrawer.draw("response", response.map((item) => item.name)));
  			
			callback();
		});
	}
}

module.exports = Flow;