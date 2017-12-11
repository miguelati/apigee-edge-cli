const vorpal = require('vorpal')();
const chalk = vorpal.chalk;
const fs = require("fs-plus");
const SwaggerParser = require('swagger-parser');
const fromXML = require("from-xml").fromXML;
const Table = require('cli-table2');
const _ = require("lodash");

class ApiProxy {
	static injectCommand(vorpal) {
		vorpal.command('apiproxy', 'Information of actual apiproxy')
			.action((args, callback) => {

		    if (vorpal.localStorage.getItem('apiproxy.name') !== null) {
		    	console.log("\n");
				console.log(chalk.gray.bold("ApiProxy: ") + chalk.blue.bold(vorpal.localStorage.getItem('apiproxy.name')));
				console.log(chalk.gray.bold("Revision: ") + chalk.blue.bold(vorpal.localStorage.getItem('apiproxy.revision')));
		    	console.log("\n");

		    	var table = new Table({
		    	    head: []
		    	  , colWidths: [50, 100]
		    	});

		    	table.push(["DisplayName", vorpal.localStorage.getItem('apiproxy.displayName')]);
		    	table.push(["Basepaths", vorpal.localStorage.getItem('apiproxy.basepaths')]);
		    	table.push(["CreatedAt", vorpal.localStorage.getItem('apiproxy.createdAt')]);
		    	table.push(["CreatedBy", vorpal.localStorage.getItem('apiproxy.createdBy')]);
		    	table.push(["LastModifiedAt", vorpal.localStorage.getItem('apiproxy.lastModifiedAt')]);
		    	table.push(["LastModifiedBy", vorpal.localStorage.getItem('apiproxy.lastModifiedBy')]);
		    	let concatComma = (previeous, actual, index, stack) => {
		    		if (previeous == "") {
		    			return actual;
		    		} else {
		    			return previeous + ", " + actual;
		    		}
		    	};

		    	let showArray = (value) => {
		    		if(Array.isArray(value)) {
		    			return value.reduce(concatComma, "");
		    		} else {
		    			return value;
		    		}
		    	}
		    	let policies = JSON.parse(vorpal.localStorage.getItem('apiproxy.policies'));
		    	table.push(["Policies", showArray(policies)]);
		    	
		    	let proxyEndpoints = JSON.parse(vorpal.localStorage.getItem('apiproxy.proxyEndpoints'));
		    	table.push(["ProxyEndpoints", showArray(proxyEndpoints)]);
		    	
		    	let targetEndpoints = JSON.parse(vorpal.localStorage.getItem('apiproxy.targetEndpoints'));
		    	table.push(["TargetEndpoints", showArray(targetEndpoints)]);

		    	console.log(table.toString());

		    	callback();
		    } else {
		    	vorpal.log(chalk.red("Apiproxy xml doesn't exists!"));
		    	callback();
		    }
		});
	
		vorpal.command('apiproxy policies', 'Get all policies')
		  	.action((args, callback) => {
			if (vorpal.localStorage.getItem('apiproxy.name') !== null) {
				console.log("\n");
				console.log(chalk.gray.bold("ApiProxy: ") + chalk.blue.bold(vorpal.localStorage.getItem('apiproxy.name')));
				console.log(chalk.gray.bold("Revision: ") + chalk.blue.bold(vorpal.localStorage.getItem('apiproxy.revision')));
				console.log("\n");

				var table = new Table({
				    head: []
				  , colWidths: [150]
				});

				let policies = JSON.parse(vorpal.localStorage.getItem('apiproxy.policies'));

				for (var i = 0; i < policies.length; i++) {
					table.push([policies[i]]);
				}

				console.log(table.toString());

				callback();
			} else {
				vorpal.log(chalk.red("Apiproxy xml doesn't exists!"));
				callback();
			}
		});
	}
}

module.exports = ApiProxy;