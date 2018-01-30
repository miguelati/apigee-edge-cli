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

class Search {
	static injectCommand(vorpal) {
		vorpal
		.command('search <query>', 'Information of actual apiproxy')
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
	}
}

module.exports = Search;