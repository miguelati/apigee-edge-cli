const vorpal = require('vorpal')();
const chalk = vorpal.chalk;
const fs = require("fs-plus");
const SwaggerParser = require('swagger-parser');
const fromXML = require("from-xml").fromXML;
const Table = require('cli-table2');
const _ = require("lodash");
const moment = require("moment");

class ApiProxy {
	static injectCommand(vorpal) {
		vorpal
		  .command('apiproxy', 'Information of actual apiproxy')
		  .action(function(args, callback) {

		    let auxVorpal = this;
		    let swaggers = fs.listSync("./apiproxy", ["xml"]);
		    if (swaggers.length == 1) {
		    	let apiproxyContent = fs.readFileSync(swaggers[0], 'utf8');
		    	let apiproxyJson = fromXML(apiproxyContent);

		    	console.log("\n");
		    	console.log(chalk.gray.bold("ApiProxy: ") + chalk.blue.bold(apiproxyJson.APIProxy["@name"]));
		    	console.log(chalk.gray.bold("Revision: ") + chalk.blue.bold(apiproxyJson.APIProxy["@revision"]));
		    	console.log("\n");

		    	var table = new Table({
		    	    head: []
		    	  , colWidths: [50, 100]
		    	});
		    	table.push(["DisplayName", apiproxyJson.APIProxy["Basepaths"]]);
		    	table.push(["Basepaths", apiproxyJson.APIProxy["Basepaths"]]);
		    	table.push(["CreatedAt", moment().millisecond(apiproxyJson.APIProxy["CreatedAt"]).format('MMMM Do YYYY, h:mm:ss a')]);
		    	table.push(["CreatedBy", apiproxyJson.APIProxy["CreatedBy"]]);
		    	table.push(["LastModifiedAt", moment().millisecond(apiproxyJson.APIProxy["LastModifiedAt"]).format('MMMM Do YYYY, h:mm:ss a')]);
		    	table.push(["LastModifiedAt", apiproxyJson.APIProxy["LastModifiedBy"]]);

		    	console.log(table.toString());

		    	callback();
		    } else {
		    	auxVorpal.log(chalk.red("Apiproxy xml doesn't exists!"));
		    	callback();
		    }
		    
		  });
	}
}

module.exports = ApiProxy;