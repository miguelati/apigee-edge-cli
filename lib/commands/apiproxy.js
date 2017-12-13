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
		    	var table = [];

		    	table.push(["DisplayName", global.localStorage.getItem('apiproxy.displayName')]);
		    	table.push(["Basepaths", global.localStorage.getItem('apiproxy.basepaths')]);
		    	table.push(["CreatedAt", global.localStorage.getItem('apiproxy.createdAt')]);
		    	table.push(["CreatedBy", global.localStorage.getItem('apiproxy.createdBy')]);
		    	table.push(["LastModifiedAt", global.localStorage.getItem('apiproxy.lastModifiedAt')]);
		    	table.push(["LastModifiedBy", global.localStorage.getItem('apiproxy.lastModifiedBy')]);
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
		    	let policies = JSON.parse(global.localStorage.getItem('apiproxy.policies'));
		    	table.push(["Policies", showArray(policies)]);
		    	
		    	let proxyEndpoints = JSON.parse(global.localStorage.getItem('apiproxy.proxyEndpoints'));
		    	table.push(["ProxyEndpoints", showArray(proxyEndpoints)]);
		    	
		    	let targetEndpoints = JSON.parse(global.localStorage.getItem('apiproxy.targetEndpoints'));
		    	table.push(["TargetEndpoints", showArray(targetEndpoints)]);

		    	console.log(ApiProxy.showTable([], table));

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

	static showTable(headers, rows) {
		console.log("\n");
		console.log(chalk.gray.bold("ApiProxy: ") + chalk.blue.bold(global.localStorage.getItem('apiproxy.name')));
		console.log(chalk.gray.bold("Revision: ") + chalk.blue.bold(global.localStorage.getItem('apiproxy.revision')));
		console.log("\n");

		var table = new Table({
    	    head: headers
    	  , colWidths: [50, 100]
    	});

    	table.push.apply(table, rows)

    	return table.toString();
	}
}

module.exports = ApiProxy;