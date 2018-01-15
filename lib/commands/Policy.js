const fs = require("fs-plus");
const _ = require("lodash");
const Command = require("../classes/core/Command");
const APIProxyHelper = require("../classes/core/helpers/APIProxy");
const Autocomplete = require("../classes/core/helpers/Autocomplete");
const TagFactory = require("../classes/xml/TagFactory");

class Policy {
	static injectCommand(vorpal) {
		vorpal
		.command('policy <policyName>', 'Open policy xml')
		.autocomplete(Autocomplete.getPolicies())
		.action(function(args, callback) {
			try {
				if(APIProxyHelper.existsPolicy(args.policyName)) {
					Command.openFile(this, `./${global.actualRevision}/apiproxy/policies/${args.policyName}.xml`, callback)
				} else {
					global.output.error(`Policiy ${args.policyName} doesn't exists!!`);
					callback();
				}
			} catch(e) {
				global.output.error();
				callback();
			}
		});

		vorpal
		.command('policy create <policyName>', 'Create a new Policy')
		//.option('-a, --add', 'Add in flow')
		.action(function(args, callback) {
			try {
				if(APIProxyHelper.existsPolicy(args.policyName)) {
					global.output.error("Policiy exists!!");
					callback();
				} else {
					let vorpal = this;
					Command.getListPolicies(vorpal, (policyFile, policyName) => {
						if(policyName == 'Access Control') {
							let accessControl = new TagFactory("AccessControl");
							accessControl.initQuestion(vorpal, args.policyName, (xml) => {
								APIProxyHelper.addPolicy(args.policyName);
								fs.writeFileSync(`./${global.actualRevision}/apiproxy/policies/${args.policyName}.xml`, xml, { encoding: 'utf8'});
								Command.openFile(vorpal, `./${global.actualRevision}/apiproxy/policies/${args.policyName}.xml`, callback);
							});
						} else {
							let content = fs.readFileSync(policyFile, 'utf8');
							APIProxyHelper.addPolicy(args.policyName);
							fs.writeFileSync(`./${global.actualRevision}/apiproxy/policies/${args.policyName}.xml`, content, { encoding: 'utf8'});
							Command.openFile(vorpal, `./${global.actualRevision}/apiproxy/policies/${args.policyName}.xml`, callback);	
						}
					});
				}
			} catch(e) {
				global.output.error(e);
				callback();
			}
		});
	}
}

module.exports = Policy;