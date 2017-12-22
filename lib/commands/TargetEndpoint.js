const fs = require("fs-plus");
const SwaggerParser = require('swagger-parser');
const fromXML = require("from-xml").fromXML;
const Table = require('cli-table2');
const _ = require("lodash");
const Command = require("../classes/core/Command");
const FlowDrawer = require("../classes/drawer/Flow.js");
const TagFactory = require("../classes/xml/TagFactory");
const APIProxyHelper = require("../classes/core/helpers/APIProxy");

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

		vorpal.command('targetEndpoint create <targetEndpointName>', 'Create a new Target Endpoint')
			.action(function(args, callback) {
		    if(APIProxyHelper.existsTargetEndpoint(args.targetEndpointName)) {
		    	console.log(global.chalk.red("TargetEndpoint exists!!"));
		    	callback();
		    } else {
		    	let nodeFiles = fs.listSync("./apiproxy/resources/node/", ["js"]);
		    	nodeFiles.unshift("< new js file >");

		    	let questions = [
		    		{type: 'list', name: 'type', message: 'Select type:', choices: ['HTTPTargetConnection', 'ScriptTarget', 'LocalTargetConnection']},
		    		{type: 'input', name: 'url', message: 'Enter the url:', when: (answer) => answer.type == "HTTPTargetConnection"},
		    		{type: 'list', name: 'script', message: 'Select your script:', choices: nodeFiles, when: (answer) => answer.type === "ScriptTarget" && nodeFiles.length > 1},
		    		{type: 'input', name: 'newScript', message: 'enter the new script:', when: (answer) => answer.type === "ScriptTarget" && (nodeFiles.length == 1 || answer.script == "< new js file >")},
		    		{type: 'list', name: 'localTargetType', message: 'Select type:', choices: ['Path', 'Apiproxy\'s name'], when: (answer) => answer.type === "LocalTargetConnection"},
		    		{type: 'input', name: 'apiProxyName', message: 'Enter the Apiproxy\'s name:', when: (answer) => answer.type === "LocalTargetConnection" && answer.localTargetType == 'Apiproxy\'s name'},
		    		{type: 'input', name: 'proxyEndpointName', message: 'Enter the ProxyEndpoint\'s name:', when: (answer) => answer.type === "LocalTargetConnection" && answer.localTargetType == "Apiproxy\'s name"},
		    		{type: 'input', name: 'path', message: 'Enter the Path:', when: (answer) => answer.type === "LocalTargetConnection" && answer.localTargetType == "Path"}
		    	];

		    	this.prompt(questions, function(result){
		    		let targetEndpoint = new TagFactory("TargetEndpoint");
		    		if(result.type === "HTTPTargetConnection") {
		    			targetEndpoint.createEmptyWithHTTPTargetConnection(args.targetEndpointName, result.url);
		    		} else if(result.type === "ScriptTarget") {
		    			if(result.script == "< new js file >") {
		    				if(result.newScript.match() === null) {

		    				}
		    				fs.writeFileSync(`./apiproxy/resources/node/${result.newScript}.js`, "", { encoding: 'utf8'});
		    				targetEndpoint.createEmptyWithScriptTarget(args.targetEndpointName, result.newScript);
		    			} else {
		    				targetEndpoint.createEmptyWithScriptTarget(args.targetEndpointName, result.script);
		    			}
		    		} else if(result.type === "LocalTargetConnection") {
		    			targetEndpoint.createEmptyLocalTargetConnection(args.targetEndpointName, {path: result.path, apiproxy: result.apiProxyName, proxyEndpoint: result.proxyEndpointName});
		    		}
		    		
		    		APIProxyHelper.addTargetEndpoint(args.targetEndpointName);

		    		fs.writeFileSync(`./apiproxy/targets/${args.targetEndpointName}.xml`, targetEndpoint.toXml(), { encoding: 'utf8'});

		    		console.log(global.chalk.green(`TargetEndpoint ${args.targetEndpointName} was created.`));
		    		callback();
		    	});
		    }
		});	
	}
}

module.exports = TargetEndpoint;