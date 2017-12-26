const fs = require("fs-plus");
const SwaggerParser = require('swagger-parser');
const fromXML = require("from-xml").fromXML;
const Table = require('cli-table2');
const _ = require("lodash");
const Command = require("../classes/core/Command");

class ApiProxy {
	static injectCommand(vorpal) {
		vorpal.command('apiproxy', 'Information of actual apiproxy')
			.action((args, callback) => {
		    if (global.localStorage.getItem('apiproxy.name') !== null) {
		    	var rows = [];

		    	rows.push(["DisplayName", global.localStorage.getItem('apiproxy.displayName')]);
		    	rows.push(["Basepaths", global.localStorage.getItem('apiproxy.basepaths')]);
		    	rows.push(["CreatedAt", global.localStorage.getItem('apiproxy.createdAt')]);
		    	rows.push(["CreatedBy", global.localStorage.getItem('apiproxy.createdBy')]);
		    	rows.push(["LastModifiedAt", global.localStorage.getItem('apiproxy.lastModifiedAt')]);
		    	rows.push(["LastModifiedBy", global.localStorage.getItem('apiproxy.lastModifiedBy')]);
		    	
		    	let policies = Command.getObject(global.localStorage.getItem('apiproxy.policies'));
		    	rows.push(["Policies", Command.showArray(policies)]);
		    	
		    	let proxyEndpoints = Command.getObject(global.localStorage.getItem('apiproxy.proxyEndpoints'));
		    	rows.push(["ProxyEndpoints", Command.showArray(proxyEndpoints)]);
		    	
		    	let targetEndpoints = Command.getObject(global.localStorage.getItem('apiproxy.targetEndpoints'));
		    	rows.push(["TargetEndpoints", Command.showArray(targetEndpoints)]);

		    	Command.showHeaderApiproxy();
		    	Command.showTable([], [50, 100], rows)

		    	callback();
		    } else {
		    	global.output.error("Apiproxy xml doesn't exists!");
		    	callback();
		    }
		});
	
		vorpal.command('apiproxy policies', 'Get all policies')
		  	.action((args, callback) => {
			if (global.localStorage.getItem('apiproxy.name')) {
				let policies = Command.getObject(global.localStorage.getItem('apiproxy.policies'));
				policies = Command.verifyArray(policies);
				Command.showHeaderApiproxy();
		    	Command.showTable([], [150], policies.map((item) => [item]));
				
				callback();
			} else {
				global.output.error("Apiproxy xml doesn't exists!");
				callback();
			}
		});

		vorpal.command('apiproxy targetEndpoint', 'Get all Target Endpoints')
		  	.action((args, callback) => {
			if (global.localStorage.getItem('apiproxy.name') !== null) {
				let targetEndpoints = Command.getObject(global.localStorage.getItem('apiproxy.targetEndpoints'));
				targetEndpoints = Command.verifyArray(targetEndpoints);

				Command.showHeaderApiproxy();
		    	Command.showTable([], [150], targetEndpoints.map((item) => [item]));
				
				callback();
			} else {
				global.output.error("Apiproxy xml doesn't exists!");
				callback();
			}
		});

		vorpal.command('apiproxy proxyEndpoint', 'Get all Proxy Endpoints')
		  	.action((args, callback) => {
			if (global.localStorage.getItem('apiproxy.name') !== null) {
				let proxyEndpoints = Command.getObject(global.localStorage.getItem('apiproxy.proxyEndpoints'));
				proxyEndpoints = Command.verifyArray(proxyEndpoints); 

				Command.showHeaderApiproxy();
		    	Command.showTable([], [150], proxyEndpoints.map((item) => [item]));
				
				callback();
			} else {
				global.output.error("Apiproxy xml doesn't exists!");
				callback();
			}
		});
	}
}

module.exports = ApiProxy;