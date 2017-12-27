const fs = require("fs-plus");
const SwaggerParser = require('swagger-parser');
const fromXML = require("from-xml").fromXML;
const Table = require('cli-table2');
const _ = require("lodash");
const Command = require("../classes/core/Command");
const APIProxyHelper = require("../classes/core/helpers/APIProxy");
const Autocomplete = require("../classes/core/helpers/Autocomplete");
const path = require("path");

class Policy {
	static injectCommand(vorpal) {
		vorpal
		.command('policy <policyName>', 'Open policy xml')
		.autocomplete(() => Autocomplete.getPolicies())
		.action(function(args, callback) {
			if(APIProxyHelper.existsPolicy(args.policyName)) {
				Command.openFile(this, `./apiproxy/policies/${args.policyName}.xml`, callback)
			} else {
				global.output.error("Policiy doesn't exists!!");
				callback();
			}
		});

		vorpal
		.command('policy create <policyName>', 'Create a new Policy')
		.option('-a, --add', 'add in flow')
		.action(function(args, callback) {
			if(APIProxyHelper.existsPolicy(args.policyName)) {
				global.output.error("Policiy exists!!");
				callback();
			} else {
				let vorpal = this;
				Command.getListPolicies(vorpal, (policySelected) => {
					let content = fs.readFileSync(policySelected, 'utf8');
					APIProxyHelper.addPolicy(args.policyName);
					fs.writeFileSync(`./apiproxy/policies/${args.policyName}.xml`, content, { encoding: 'utf8'});
					Command.openFile(vorpal, `./apiproxy/policies/${args.policyName}.xml`, callback);
				});
			}
		});
	}
}

module.exports = Policy;