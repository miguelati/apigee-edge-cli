const fs = require("fs-plus");
const SwaggerParser = require('swagger-parser');
const fromXML = require("from-xml").fromXML;
const Table = require('cli-table2');
const _ = require("lodash");
const Command = require("../classes/core/Command");
const FlowDrawer = require("../classes/drawer/Flow.js");

class TargetEndpoint {
	static injectCommand(vorpal) {
		vorpal.command('targetEndpoint <targetEndpointName>', 'Details of a TargetEndpoint')
			.autocomplete({
				data: function () {
					let autocomplete = Command.getObject(global.localStorage.getItem('apiproxy.targetEndpoints'));
					let result = Command.verifyArray(autocomplete);
					return result.map((item) => (item.indexOf(" ") === -1) ? item : `"${item}"`);
				}
			})
			.action((args, callback) => {
		    if (vorpal.localStorage.getItem('apiproxy.name')) {
		    	var rows = [];

		    	rows.push(["Name", global.localStorage.getItem('target.'+ args.targetEndpointName +'.name')]);
		    	
		    	// PreFlow
		    	let PreFlowRequest =  Command.getObject(global.localStorage.getItem('target.'+ args.targetEndpointName +'.preflow.request'));
		    	rows.push(["PreFlow Request", Command.showArray(Command.getArray(PreFlowRequest, 'name'))]);

		    	let PreFlowResponse = Command.getObject(global.localStorage.getItem('target.'+ args.targetEndpointName +'.preflow.response'));
		    	rows.push(["PreFlow Response", Command.showArray(Command.getArray(PreFlowResponse, 'name'))]);
		    	
		    	// PostFlow
		    	let PostFlowRequest = Command.getObject(global.localStorage.getItem('target.'+ args.targetEndpointName +'.postflow.request'));
		    	rows.push(["PostFlow", Command.showArray(Command.getArray(PostFlowRequest, 'name'))]);

		    	let PostFlowResponse = Command.getObject(global.localStorage.getItem('target.'+ args.targetEndpointName +'.postflow.response'));
		    	rows.push(["PostFlow", Command.showArray(Command.getArray(PostFlowResponse, 'name'))]);

		    	// Flows
		    	let flows = Command.getObject(global.localStorage.getItem('proxy.'+ args.targetEndpointName +'.flows.nameFlows'));
		    	rows.push(["Flows", Command.showArray(flows)]);
		    	
		    	Command.showHeaderApiproxy();
		    	Command.showTable([], [50, 100], rows)

		    	callback();
		    } else {
		    	vorpal.log(global.chalk.red("Apiproxy xml doesn't exists!"));
		    	callback();
		    }
		});

		vorpal.command('targetEndpoint preflow <targetEndpointName>', 'Show preflow graph')
			.autocomplete({
				data: function () {
					let autocomplete = Command.getObject(global.localStorage.getItem('apiproxy.targetEndpoints'));
					let result = Command.verifyArray(autocomplete);
					return result.map((item) => (item.indexOf(" ") === -1) ? item : `"${item}"`);
				}
			})
			.action((args, callback) => {
		    if (vorpal.localStorage.getItem('apiproxy.name')) {
		    	let requestAux = Command.getObject(global.localStorage.getItem(`target.${args.targetEndpointName}.preflow.request`));
		    	let request = Command.verifyArray(requestAux);

		    	let responseAux = Command.getObject(global.localStorage.getItem(`target.${args.targetEndpointName}.preflow.response`));
		    	let response = Command.verifyArray(responseAux);

		    	console.log(FlowDrawer.draw("request", request.map((item) => item.name)));
		    	console.log(FlowDrawer.draw("response", response.map((item) => item.name)));

		    	callback();
		    } else {
		    	vorpal.log(global.chalk.red("Apiproxy xml doesn't exists!"));
		    	callback();
		    }
		});

		vorpal.command('targetEndpoint postflow <targetEndpointName>', 'Show postflow graph')
			.autocomplete({
				data: function () {
					let autocomplete = Command.getObject(global.localStorage.getItem('apiproxy.targetEndpoints'));
					let result = Command.verifyArray(autocomplete);
					return result.map((item) => (item.indexOf(" ") === -1) ? item : `"${item}"`);
				}
			})
			.action((args, callback) => {
		    if (vorpal.localStorage.getItem('apiproxy.name')) {
		    	let requestAux = Command.getObject(global.localStorage.getItem(`target.${args.targetEndpointName}.postflow.request`));
		    	let request = Command.verifyArray(requestAux);

		    	let responseAux = Command.getObject(global.localStorage.getItem(`target.${args.targetEndpointName}.postflow.response`));
		    	let response = Command.verifyArray(responseAux);

		    	console.log(FlowDrawer.draw("request", request.map((item) => item.name)));
		    	console.log(FlowDrawer.draw("response", response.map((item) => item.name)));

		    	callback();
		    } else {
		    	vorpal.log(global.chalk.red("Apiproxy xml doesn't exists!"));
		    	callback();
		    }
		});

	}
}

module.exports = TargetEndpoint;