const vorpal = require('vorpal')();
const chalk = vorpal.chalk;
const fs = require("fs-plus");
const SwaggerParser = require('swagger-parser');
const ApiProxy = require('../classes/generates/ApiProxy');
const Init = require('./init');

class Rewirte {
	static injectCommand(vorpal) {
		vorpal
		.command('rewrite', 'Rewrite all xml files in apiproxy')
		.action(function(args, callback) {

			let auxVorpal = this;
			
			if(fs.existsSync("./apiproxy")) {

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
							Init.existSwagger(auxVorpal, (swagger) => {
								if(swagger === false) {
									console.log("You must create a swagger file or download the Apiproxy");
									callback();
								} else {
									Init.parseSwagger(swagger, (title) => {
										if(title !== null) {
											auxVorpal.log(chalk.green('was rewrited!'));
											auxVorpal.delimiter(chalk.green(title + "$"));
										}
										callback();
									});
								}
							});
						}
					});
		    } else {
		    	auxVorpal.log(chalk.yellow("Can't rewrite, apiproxy folder doesn't exists!!!"));
		    }    
		});
	}
}

module.exports = Rewirte;