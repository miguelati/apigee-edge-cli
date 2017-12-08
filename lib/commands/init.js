const vorpal = require('vorpal')();
const chalk = vorpal.chalk;
const fs = require("fs-plus");
const SwaggerParser = require('swagger-parser');
const ApiProxy = require('../classes/generates/ApiProxy');

class Init {
	static injectCommand(vorpal) {
		vorpal
		  .command('init', 'Load swagger and create proxy with specs')
		  .action(function(args, callback) {

		    let auxVorpal = this;
		    let swaggers = fs.listSync("./", ["yaml", "json"]);
		    
		    SwaggerParser.validate(swaggers[0])
		      .then(function(api) {
		        if(!fs.existsSync("./apiproxy")) {
		          var dirs = ["./apiproxy/policies/", "./apiproxy/proxies/", "./apiproxy/resoruces/jsc", "./apiproxy/targets"];

		          for (var i = 0; i < dirs.length; i++) {
		            auxVorpal.log(chalk.yellow("Create " + dirs[i]));
		            fs.makeTreeSync(dirs[i]);
		          }

		          ApiProxy.create(api);
		        } else {
		          auxVorpal.log(chalk.yellow("apiproxy folder exists!!!"));
		        }
		        
		        auxVorpal.delimiter(chalk.green(api.info.title + "$"));
		        
		        callback();
		      })
		      .catch(function(err) {
		        auxVorpal.error('Onoes! The API is invalid. ' + err.message);
		        callback();
		      });
		  });
	}
}

module.exports = Init;