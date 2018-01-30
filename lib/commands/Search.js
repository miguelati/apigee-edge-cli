const fs = require("fs-plus");
const CLI = require("clui");
const Spinner = CLI.Spinner;
const _ = require("lodash");
const Command = require("../classes/core/Command");
const APIProxyHelper = require("../classes/core/helpers/APIProxy");
const ProxyEndpointHelper = require("../classes/core/helpers/ProxyEndpoint");
const TargetEndpointHelper = require("../classes/core/helpers/TargetEndpoint");
const PolicyHelper = require("../classes/core/helpers/Policy");
const Enviroment = require('../classes/core/Enviroment');
const Prompt = require('../classes/core/ui/Prompt');
const Autocomplete = require("../classes/core/helpers/Autocomplete");

class Search {
	static injectCommand(vorpal) {
		vorpal
		.command('search byName <query>', 'Information of actual apiproxy')
		.action((args, callback) => {
		    try {
		    	let toFind = [];
		    	let proxyEndpoints = APIProxyHelper.getProxyEndpoints();
		    	toFind.push(proxyEndpoints.map((item) => [global.chalk.blue('ProxyEndpoint'), item]));

		    	
		    	let targetEndpoints = APIProxyHelper.getTargetEndpoints();
		    	toFind.push(targetEndpoints.map((item) => [global.chalk.blue('TargetEndpoint'), item]));
				
				let policies = APIProxyHelper.getPolicies();
				toFind.push(policies.map((item) => [global.chalk.blue('Policy'), item]));

		    	let resources = APIProxyHelper.getResources();
		    	toFind.push(resources.map((item) => [global.chalk.blue('Resource'), item]));
		    	
		    	for(let index in proxyEndpoints) {
		    		let proxyEndpointHelper = new ProxyEndpointHelper(proxyEndpoints[index]);
		    		toFind.push(proxyEndpointHelper.getFlowsNames().map((item) => [global.chalk.blue(`Flow name in ProxyEndpoint ${proxyEndpointHelper.getName()}`), item]));
		    	}
		    	
		    	for(let index in targetEndpoints) {
		    		let targetEndpointHelper = new TargetEndpointHelper(targetEndpoints[index]);
		    		toFind.push(targetEndpointHelper.getFlowsNames().map((item) => [global.chalk.blue(`Flow name in TargetEndpoint ${proxyEndpointHelper.getName()}`), item]));
		    	}

		    	toFind = _.flatten(toFind);
		    	_.remove(toFind, (item) => _.isEmpty(item[1]) || item[1].toLowerCase().indexOf(args.query.toLowerCase()) === -1);

		    	console.log();
		    	
		    	Command.showTable([], [30, 70], toFind.map((item) => [item[0], item[1].replace(new RegExp(args.query,"gi"), global.chalk.yellow('$&'))]))
				
		    	callback();
		    } catch(e) {
		    	global.output.error(e);
		    	callback();
		    }
		});

		vorpal
		.command('search policyAttachedTo <query>', 'Information of actual apiproxy')
		.autocomplete(Autocomplete.getPolicies())
		.action((args, callback) => {
		    try {
		    	let policies = APIProxyHelper.getPolicies();
		    	
		    	if(policies.indexOf(args.query) == -1) {
		    		throw "Policy name doesn't exists";
		    	} else {
		    		let toFind = [];
		    		let arrow = global.chalk.red('>');
		    		
		    		let proxyEndpoints = APIProxyHelper.getProxyEndpoints();
		    		let targetEndpoints = APIProxyHelper.getTargetEndpoints();

		    		for(let index in proxyEndpoints) {
		    			let proxyEndpointHelper = new ProxyEndpointHelper(proxyEndpoints[index]);
		    			let flows = proxyEndpointHelper.getFlowsNames();
		    			
		    			let preFlowRequest = proxyEndpointHelper.getPreFlowRequestStepNames();
		    			for(let indexPreFlowRequest in preFlowRequest)
		    				if(preFlowRequest[indexPreFlowRequest] === args.query) toFind.push(`ProxyEndpoint ${proxyEndpointHelper.getName()} ${arrow} PreFlow ${arrow} Request`);
		    			let preFlowResponse = proxyEndpointHelper.getPreFlowResponseStepNames();
		    			for(let indexPreFlowResponse in preFlowResponse)
		    				if(preFlowResponse[indexPreFlowResponse] === args.query) toFind.push(`ProxyEndpoint ${proxyEndpointHelper.getName()} ${arrow} PreFlow ${arrow} Response`);

		    			for(let indexFlow in flows) {
		    				
		    				let request = proxyEndpointHelper.getFlowRequestStepNames(flows[indexFlow]);

		    				for(let indexRequest in request) 
		    					if(request[indexRequest] === args.query) toFind.push(`ProxyEndpoint ${proxyEndpointHelper.getName()} ${arrow} Flow ${flows[indexFlow]} ${arrow} Request`);
		    				
		    				let response = proxyEndpointHelper.getFlowResponseStepNames(flows[indexFlow]);
		    				for(let indexResponse in response) 
		    					if(response[indexResponse] === args.query) toFind.push(`ProxyEndpoint ${proxyEndpointHelper.getName()} ${arrow} Flow ${flows[indexFlow]} ${arrow} Response`);
		    			}

		    			let postFlowRequest = proxyEndpointHelper.getPostFlowRequestStepNames();
		    			for(let indexPostFlowRequest in postFlowRequest)
		    				if(postFlowRequest[indexPostFlowRequest] === args.query) toFind.push(`ProxyEndpoint ${proxyEndpointHelper.getName()} ${arrow} PostFlow ${arrow} Request`);
		    			let postFlowResponse = proxyEndpointHelper.getPostFlowResponseStepNames();
		    			for(let indexPostFlowResponse in postFlowResponse)
		    				if(postFlowResponse[indexPostFlowResponse] === args.query) toFind.push(`ProxyEndpoint ${proxyEndpointHelper.getName()} ${arrow} PostFlow ${arrow} Response`);
		    		}
		    		
		    		for(let index in targetEndpoints) {
		    			let targetEndpointHelper = new TargetEndpointHelper(targetEndpoints[index]);
		    			let flows = targetEndpointHelper.getFlowsNames();

		    			let preFlowRequest = targetEndpointHelper.getPreFlowRequestStepNames();
		    			for(let indexPreFlowRequest in preFlowRequest)
		    				if(preFlowRequest[indexPreFlowRequest] === args.query) toFind.push(`TargetEndpoint ${targetEndpointHelper.getName()} ${arrow} PreFlow ${arrow} Request`);
		    			let preFlowResponse = targetEndpointHelper.getPreFlowResponseStepNames();
		    			for(let indexPreFlowResponse in preFlowResponse)
		    				if(preFlowResponse[indexPreFlowResponse] === args.query) toFind.push(`TargetEndpoint ${targetEndpointHelper.getName()} ${arrow} PreFlow ${arrow} Response`);


		    			for(let indexFlow in flows) {
		    				let request = targetEndpointHelper.getFlowRequestStepNames(flows[indexFlow]);
		    				for(let indexRequest in request) {
		    					if(request[indexRequest] === args.query) toFind.push(`TargetEndpoint ${targetEndpointHelper.getName()} ${arrow} Flow ${flows[indexFlow]} ${arrow} Request`);
		    				}
		    				let response = targetEndpointHelper.getFlowRequestStepNames(flows[indexFlow]);
		    				for(let indexResponse in response) {
		    					if(response[indexResponse] === args.query) toFind.push(`TargetEndpoint ${targetEndpointHelper.getName()} ${arrow} Flow ${flows[indexFlow]} ${arrow} Response`);
		    				}
		    			}

		    			let postFlowRequest = targetEndpointHelper.getPostFlowRequestStepNames();
		    			for(let indexPostFlowRequest in postFlowRequest)
		    				if(postFlowRequest[indexPostFlowRequest] === args.query) toFind.push(`TargetEndpoint ${targetEndpointHelper.getName()} ${arrow} PostFlow ${arrow} Request`);
		    			let postFlowResponse = targetEndpointHelper.getPostFlowResponseStepNames();
		    			for(let indexPostFlowResponse in postFlowResponse)
		    				if(postFlowResponse[indexPostFlowResponse] === args.query) toFind.push(`TargetEndpoint ${targetEndpointHelper.getName()} ${arrow} PostFlow ${arrow} Response`);
		    		}
		    		
		    		Command.showTable([], [100], toFind.map((item) => [item]));
		    		
		    	}
		    } catch(e) {
		    	global.output.error(e);
		    } finally {
		    	callback();
		    }
		});
	}
}

module.exports = Search;