const fs = require("fs-plus");
const SwaggerParser = require('swagger-parser');
const fromXML = require("from-xml").fromXML;
const Table = require('cli-table2');
const _ = require("lodash");
const Command = require("../classes/core/Command");
const FlowDrawer = require("../classes/drawer/Flow.js");
const TagFactory = require("../classes/xml/TagFactory");
const APIProxyHelper = require("../classes/core/helpers/APIProxy");
const TargetEndpointHelper = require("../classes/core/helpers/TargetEndpoint");
const Autocomplete = require("../classes/core/helpers/Autocomplete");

class TargetEndpoint {
	static injectCommand(vorpal) {
		vorpal.command('targetEndpoint <targetEndpointName>', 'Details of a TargetEndpoint')
			.autocomplete(Autocomplete.getTargetEndpoints())
			.action((args, callback) => {


				let targetEndpointHelper = new TargetEndpointHelper(args.targetEndpointName);
				var rows = [];

				rows.push(["Name", targetEndpointHelper.getName()]);
				rows.push(["FaultRules", targetEndpointHelper.getFaultRulesNames().join()]);
				rows.push(["PreFlow Request", targetEndpointHelper.getPreFlowRequestStepNames().join()]);
				rows.push(["PreFlow Response", targetEndpointHelper.getPreFlowResponseStepNames().join()]);
				rows.push(["PostFlow Request", targetEndpointHelper.getPostFlowRequestStepNames().join()]);
				rows.push(["PostFlow Response", targetEndpointHelper.getPostFlowResponseStepNames().join()]);
				rows.push(["Flows", targetEndpointHelper.getFlowsNames().join()]);
					
				Command.showHeaderApiproxy();
				Command.showTable([], [30, 70], rows)

				callback();
		});

		vorpal.command('targetEndpoint preflow <targetEndpointName>', 'Show preflow graph')
			.autocomplete(Autocomplete.getTargetEndpoints())
			.action((args, callback) => {
		    
		    	let targetEndpointHelper = new TargetEndpointHelper(args.targetEndpointName);

				global.output.log(FlowDrawer.draw("request", targetEndpointHelper.getPreFlowRequestStepNames()));
				global.output.log(FlowDrawer.draw("response", targetEndpointHelper.getPreFlowResponseStepNames()));

				callback();
		});

		vorpal.command('targetEndpoint postflow <targetEndpointName>', 'Show postflow graph')
			.autocomplete(Autocomplete.getTargetEndpoints())
			.action((args, callback) => {
		    	
		    	let targetEndpointHelper = new TargetEndpointHelper(args.targetEndpointName);
		    
		    	global.output.log(FlowDrawer.draw("request", targetEndpointHelper.getPostFlowRequestStepNames()));
		    	global.output.log(FlowDrawer.draw("response", targetEndpointHelper.getPostFlowResponseStepNames()));

		    	callback();
		});

		vorpal.command('targetEndpoint create <targetEndpointName>', 'Create a new Target Endpoint')
			.action(function(args, callback) {
		    if(APIProxyHelper.existsTargetEndpoint(args.targetEndpointName)) {
		    	global.output.error("TargetEndpoint exists!!");
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

		    		global.output.success(`TargetEndpoint ${args.targetEndpointName} was created.`);
		    		callback();
		    	});
		    }
		});	
	}
}

module.exports = TargetEndpoint;