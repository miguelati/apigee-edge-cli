const fs = require("fs-plus");
const SwaggerParser = require('swagger-parser');
const fromXML = require("from-xml").fromXML;
const Table = require('cli-table2');
const _ = require("lodash");
const Command = require("../classes/core/Command");
const APIProxyHelper = require("../classes/core/helpers/APIProxy");
const APIProxy = require('../classes/generates/APIProxy');

class ApiProxy {
	static injectCommand(vorpal) {
		vorpal.command('apiproxy', 'Information of actual apiproxy')
			.action((args, callback) => {
		    
			var rows = [];
			let info = APIProxyHelper.getInfo();

			rows.push(["DisplayName", info.displayName]);
			rows.push(["Basepaths", (_.isArray(info.basepaths)) ? info.basepaths.join() : info.basepaths]);
			rows.push(["CreatedAt", info.createdAt.display]);
			rows.push(["CreatedBy", info.createdBy]);
			rows.push(["LastModifiedAt", info.lastModifiedAt.display]);
			rows.push(["LastModifiedBy", info.lastModifiedBy]);
			rows.push(["Policies", APIProxyHelper.getPolicies().join()]);
			rows.push(["ProxyEndpoints", APIProxyHelper.getProxyEndpoints().join()]);
			rows.push(["TargetEndpoints", APIProxyHelper.getTargetEndpoints().join()]);

			Command.showHeaderApiproxy();
			Command.showTable([], [30, 70], rows)

			callback();
		});

		vorpal.command('apiproxy load', 'Load from swagger file')
			.action((args, callback) => {
			
			if(fs.existsSync("./apiproxy")) {
				global.output.error("ApiProxy folder exists");
				callback();
			} else {
				ApiProxy.existSwagger(vorpal.activeCommand, (swagger) => {
					if(swagger === false) {
						global.output.red("You must create a swagger file or download the Apiproxy");
						callback();
					} else {
						ApiProxy.parseSwagger(swagger, (title) => {
							if(title !== null) {
								vorpal.activeCommand.delimiter(global.chalk.green(title + "$"));
							}
							callback();
						});
					}
				});
			}
		});

		vorpal.command('apiproxy rewrite', 'Rewrite all xml files from swagger')
			.action((args, callback) => {
			if(fs.existsSync("./apiproxy")) {

				vorpal.activeCommand.prompt({
				      type: 'confirm',
				      name: 'continue',
				      default: false,
				      message: 'That sounds like a really bad idea. Continue?',
				    }, function(result){
						if (!result.continue) {
							global.output.success("Ok!");
							callback();
						} else {
							ApiProxy.existSwagger(vorpal.activeCommand, (swagger) => {
								if(swagger === false) {
									global.output.error("You must create a swagger file or download the Apiproxy");
									callback();
								} else {
									ApiProxy.parseSwagger(swagger, (title) => {
										if(title !== null) {
											global.output.success('was rewrited!');
											vorpal.activeCommand.delimiter(global.chalk.green(title + "$"));
										}
										callback();
									});
								}
							});
						}
					});
		  	} else {
		  		global.output.error("Can't rewrite, apiproxy folder doesn't exists!!!");
		  		callback();
		  	}    
		});
	
		vorpal.command('apiproxy policies', 'Get all policies')
		  	.action((args, callback) => {
			
			let policies = APIProxyHelper.getPolicies();
			Command.showHeaderApiproxy();
			Command.showTable([], [100], policies.map((item) => [item]));

			callback();
		});

		vorpal.command('apiproxy targetEndpoint', 'Get all Target Endpoints')
		  	.action((args, callback) => {
			
			let targetEndpoints = APIProxyHelper.getTargetEndpoints();
			Command.showHeaderApiproxy();
			Command.showTable([], [100], targetEndpoints.map((item) => [item]));

			callback();
		});

		vorpal.command('apiproxy proxyEndpoint', 'Get all Proxy Endpoints')
		  	.action((args, callback) => {

			let proxyEndpoints = APIProxyHelper.getProxyEndpoints();
			
			Command.showHeaderApiproxy();
			Command.showTable([], [100], proxyEndpoints.map((item) => [item]));

			callback();
		});
	}

	static parseSwagger(file, callback) {
		SwaggerParser
			.validate(file)
			.then(function(api) {
	        	APIProxy.create(api);
				APIProxy.generatePostman(api.info.title, api);
				callback(api.info.title);
			})
			.catch(function(err) {
				global.output.error(`Onoes! The API is invalid. ${err.message}`);
				callback(null);
			});
	}

	static existSwagger(vorpal, callback) {
		let swaggers = fs.listSync("./", ["yaml", "json"]);
		
		if(swaggers.length == 0) {
			callback(false);
		} else if(swaggers.length == 1) {
			callback(swaggers[0]);
		} else {
			swaggers.push("none");
        	vorpal.prompt({
		      type: 'list',
		      name: 'swagger',
		      choices: swaggers,
		      default: 'none',
		      message: 'Select the swagger file:',
		    }, function(result){
		    	if(result.swagger == 'none') {
		    		callback(false);
		    	} else {
		    		return callback(result.swagger);
		    	}
			});
		}
	}
}

module.exports = ApiProxy;