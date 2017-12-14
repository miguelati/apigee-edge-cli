const vorpal = require('vorpal')();
const chalk = vorpal.chalk;
const fs = require("fs-plus");
const SwaggerParser = require('swagger-parser');
const ApiProxy = require('../classes/generates/ApiProxy');
const fromXML = require("from-xml").fromXML;
const moment = require("moment");
const Cache = require('../classes/core/Cache');

class Init {
	static injectCommand(vorpal) {
		vorpal
		  .command('init', 'Load swagger and create proxy with specs')
		  .action(function(args, callback) {

		    let auxVorpal = this;

		    if(fs.existsSync("./apiproxy")) {
		    	Cache.load("./apiproxy/");
		    	let title = vorpal.localStorage.getItem('apiproxy.name');
		    	if(title == null) {
		    		console.log(chalk.red("Structure error in ApiProxy folder"));
		    		callback();
		    	} else {
		    		auxVorpal.delimiter(chalk.green(title + "$"));
		    		callback();
		    	}
		    } else {
		    	Init.existSwagger(auxVorpal, (swagger) => {
		    		if(swagger === false) {
		    			console.log("You must create a swagger file or download the Apiproxy");
		    			callback();
		    		} else {
		    			Init.parseSwagger(swagger, (title) => {
		    				if(title !== null) {
		    					Cache.load("./apiproxy/");
		    					auxVorpal.delimiter(chalk.green(title + "$"));
		    				}
		    				callback();
		    			});
		    		}
		    	});
		    }
		});
	}

	static readTitleFromApiproxyFile(){
		let xml = fs.listSync("./apiproxy/", ["xml"]);
		if(xml.length == 1) {
			let apiproxyContent = fs.readFileSync(xml[0], 'utf8');
			let json = fromXML(apiproxyContent);
			return json.APIProxy["@name"];
		} else {
			return null;
		}
	}

	static parseSwagger(file, callback) {
		SwaggerParser
			.validate(file)
			.then(function(api) {
	        	ApiProxy.create(api);
				ApiProxy.generatePostman(api.info.title, api);
				callback(api.info.title);
			})
			.catch(function(err) {
				console.error(chalk.red('Onoes! The API is invalid. ' + err.message));
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

module.exports = Init;