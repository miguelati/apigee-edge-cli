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
const findInFiles = require('find-in-files');

class Search {
	static injectCommand(vorpal) {
		vorpal
		.command('search nameBy <type> <query>', 'Information of actual apiproxy')
		.autocomplete(['all','proxyEndpoints', 'targetEndpoints', 'policies', 'resources', 'flows'])
		.action((args, callback) => {
		    try {
		    	let toFind = [];
		    	if(args.type === 'all' || args.type === 'proxyEndpoints') {
		    		let proxyEndpoints = APIProxyHelper.getProxyEndpoints();
		    		toFind.push(proxyEndpoints.map((item) => [global.chalk.blue('ProxyEndpoint'), item]));	
		    	}
		    	
		    	if(args.type === 'all' || args.type === 'targetEndpoints') {
		    		let targetEndpoints = APIProxyHelper.getTargetEndpoints();
		    		toFind.push(targetEndpoints.map((item) => [global.chalk.blue('TargetEndpoint'), item]));	
		    	}
		    	
		    	if(args.type === 'all' || args.type === 'policies') {
		    		let policies = APIProxyHelper.getPolicies();
		    		toFind.push(policies.map((item) => [global.chalk.blue('Policy'), item]));	
		    	}
		    	
				if(args.type === 'all' || args.type === 'resources') {
					let resources = APIProxyHelper.getResources();
					toFind.push(resources.map((item) => [global.chalk.blue('Resource'), item]));	
				}
				
				if(args.type === 'all' || args.type === 'flows') {
					let proxyEndpoints = APIProxyHelper.getProxyEndpoints();
					for(let index in proxyEndpoints) {
						let proxyEndpointHelper = new ProxyEndpointHelper(proxyEndpoints[index]);
						toFind.push(proxyEndpointHelper.getFlowsNames().map((item) => [global.chalk.blue(`Flow name in ProxyEndpoint ${proxyEndpointHelper.getName()}`), item]));
					}
					
					let targetEndpoints = APIProxyHelper.getTargetEndpoints();
					for(let index in targetEndpoints) {
						let targetEndpointHelper = new TargetEndpointHelper(targetEndpoints[index]);
						toFind.push(targetEndpointHelper.getFlowsNames().map((item) => [global.chalk.blue(`Flow name in TargetEndpoint ${proxyEndpointHelper.getName()}`), item]));
					}	
				}

				toFind = _.flatten(toFind);
				_.remove(toFind, (item) => _.isEmpty(item[1]) || item[1].toLowerCase().indexOf(args.query.toLowerCase()) === -1);

				if(toFind.length > 0) Command.showTable([], [30, 70], toFind.map((item) => [item[0], item[1].replace(new RegExp(args.query,"gi"), global.chalk.yellow('$&'))]));
				else global.output.error("No matches result");
		    } catch(e) {
		    	global.output.error(e);
		    } finally {
		    	callback();
		    }
		});

		vorpal
		.command('search text <text>', 'Search a text in all files')
		.option('-s,--show', 'Show matches in terminal')
		.action(async (args, callback) => { 
			var countdown = new Spinner(global.chalk.blue(`Searching in all files... `), ['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷']);
			try {
				countdown.start();
				let result = await findInFiles.find(args.text, `./${global.actualRevision}/apiproxy/`);
				countdown.stop();

				let prompt = new Prompt();
				prompt.list('file', 'Select a file to show you the matches', _.keys(result).map((key) => key.replace(`${global.actualRevision}/apiproxy/`, '')));
				let answer = await prompt.show();

				if(args.options.show) {
					
					let file = result[`${global.actualRevision}/apiproxy/${answer.file}`];
					let rows = [];

					rows.push([`matches: ${file.count}`]);
					for(let index in file.line) rows.push([file.line[index].trim().replace(new RegExp(args.text,"gi"), global.chalk.yellow('$&'))])
					if(rows.length > 0) Command.showTable([], [100], rows);
				} else {
					if(fs.existsSync(`${global.actualRevision}/apiproxy/${answer.file}`)) await Command.openFile(`${global.actualRevision}/apiproxy/${answer.file}`);
					else global.output.error(`File ${global.actualRevision}/apiproxy/${answer.file} doesn't exists!!`);
				}
			} catch(e) {
				countdown.stop();
				global.output.error(e);
			} finally {
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