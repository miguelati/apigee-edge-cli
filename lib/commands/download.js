const vorpal = require('vorpal')();
const chalk = vorpal.chalk;
const fs = require("fs-plus");
const SwaggerParser = require('swagger-parser');
const ApiProxyRest = require('../classes/apigee/apiproxy');

class Download {
	static injectCommand(vorpal) {
		vorpal
		.command('download <apiproxyName>', 'Download apiproxy from apigee.com')
		.option('-r, --revision', 'Number of revision to download.')
		.action(function(args, callback) {
			console.log(args);
		    
		});
	}
}

module.exports = Download;