const vorpal = require('vorpal')();
const chalk = vorpal.chalk;
const fs = require("fs-plus");
const SwaggerParser = require('swagger-parser');
const ApiProxy = require('../classes/generates/ApiProxy');

class Rewirte {
	static injectCommand(vorpal) {
		vorpal
		  .command('rewrite', 'Rewrite all xml files in apiproxy')
		  .action(function(args, callback) {

		    let auxVorpal = this;
		    let swaggers = fs.listSync("./", ["yaml", "json"]);
		    
		    SwaggerParser.validate(swaggers[0])
		      .then(function(api) {
		        if(!fs.existsSync("./apiproxy")) {
					auxVorpal.log(chalk.yellow("Can't rewrite, apiproxy folder doesn't exists!!!"));
		        } else {
		        	auxVorpal.prompt({
				      type: 'confirm',
				      name: 'continue',
				      default: false,
				      message: 'That sounds like a really bad idea. Continue?',
				    }, function(result){
						if (!result.continue) {
							auxVorpal.log('Ok!.');
							callback();
						} else {
							ApiProxy.create(api);
							auxVorpal.log(chalk.green('was rewrited!'));
							callback();
						}
					});
		        }
		      })
		      .catch(function(err) {
		        auxVorpal.error('Onoes! The API is invalid. ' + err.message);
		        callback();
		      });
		  });
	}
}

module.exports = Rewirte;