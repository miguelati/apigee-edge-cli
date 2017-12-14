const vorpal = require('vorpal')();
const chalk = vorpal.chalk;
const fs = require("fs-plus");
const SwaggerParser = require('swagger-parser');
const fromXML = require("from-xml").fromXML;
const Table = require('cli-table2');
const _ = require("lodash");
const Command = require("../classes/core/command");

class ProxyEndpoint {
	static injectCommand(vorpal) {
		vorpal.command('proxyEndpoint <proxyEndpointName>', 'List all ProxyEndpoints')
			.autocomplete({
				data: function () {
					let autocomplete = Command.getObject(global.localStorage.getItem('apiproxy.proxyEndpoints'));
					return Command.verifyArray(autocomplete);
				}
			})
			.action((args, callback) => {
		    if (vorpal.localStorage.getItem('apiproxy.name') !== null) {
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
		    	vorpal.log(chalk.red("Apiproxy xml doesn't exists!"));
		    	callback();
		    }
		});
	}
}

module.exports = ProxyEndpoint;