const vorpal = require('vorpal')();
const chalk = vorpal.chalk;
const fs = require("fs-plus");
const SwaggerParser = require('swagger-parser');
const ApiProxy = require('../classes/generates/ApiProxy');
const fromXML = require("from-xml").fromXML;
const moment = require("moment");

class Init {
	static injectCommand(vorpal) {
		vorpal
		  .command('init', 'Load swagger and create proxy with specs')
		  .action(function(args, callback) {

		    let auxVorpal = this;

		    if(fs.existsSync("./apiproxy")) {
		    	Init.loadDataToCache(vorpal);
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
		    					auxVorpal.delimiter(chalk.green(title + "$"));
		    				}
		    				callback();
		    			});
		    		}
		    	});
		    }
		});
	}

	static loadDataToCache(vorpal) {
		Init.loadApiproxyCache(vorpal)
	}

	static loadApiproxyCache(vorpal) {
		let xml = fs.listSync("./apiproxy/", ["xml"]);
		if(xml.length == 1) {
			let apiproxyContent = fs.readFileSync(xml[0], 'utf8');
			let json = fromXML(apiproxyContent);

			
			vorpal.localStorage.setItem('apiproxy.name', json.APIProxy["@name"]);
			vorpal.localStorage.setItem('apiproxy.revision', json.APIProxy["@revision"]);
			vorpal.localStorage.setItem('apiproxy.displayName', json.APIProxy["DisplayName"]);
			vorpal.localStorage.setItem('apiproxy.basepaths', json.APIProxy["Basepaths"]);
			vorpal.localStorage.setItem('apiproxy.createdAt', moment().millisecond(json.APIProxy["CreatedAt"]).format('MMMM Do YYYY, h:mm:ss a'));
			vorpal.localStorage.setItem('apiproxy.createdBy', json.APIProxy["CreatedBy"]);
			vorpal.localStorage.setItem('apiproxy.lastModifiedAt', moment().millisecond(json.APIProxy["LastModifiedAt"]).format('MMMM Do YYYY, h:mm:ss a'));
			vorpal.localStorage.setItem('apiproxy.lastModifiedBy', json.APIProxy["LastModifiedBy"]);
			vorpal.localStorage.setItem('apiproxy.policies', JSON.stringify(json.APIProxy.Policies.Policy));
			vorpal.localStorage.setItem('apiproxy.proxyEndpoints', JSON.stringify(json.APIProxy.ProxyEndpoints.ProxyEndpoint));
			vorpal.localStorage.setItem('apiproxy.targetEndpoints', JSON.stringify(json.APIProxy.TargetEndpoints.TargetEndpoint));
		}
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
	        	if(!fs.existsSync("./apiproxy")) {
					ApiProxy.create(api);
				}
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