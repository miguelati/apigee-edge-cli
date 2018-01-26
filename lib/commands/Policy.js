const fs = require("fs-plus");
const _ = require("lodash");
const Command = require("../classes/core/Command");
const APIProxyHelper = require("../classes/core/helpers/APIProxy");
const Autocomplete = require("../classes/core/helpers/Autocomplete");
const TagFactory = require("../classes/xml/TagFactory");
const fromXML = require("from-xml").fromXML;
const toXML = require("to-xml").toXML;

class Policy {
	static injectCommand(vorpal) {
		vorpal
		.command('policy <policyName>', 'Open policy xml')
		.autocomplete(Autocomplete.getPolicies())
		.action(async (args, callback) => {
			try {
				if(APIProxyHelper.existsPolicy(args.policyName)) await Command.openFile(`./${global.actualRevision}/apiproxy/policies/${args.policyName}.xml`);
				else global.output.error(`Policiy ${args.policyName} doesn't exists!!`);
			} catch(e) {
				global.output.error();
			} finally {
				callback();
			}
		});

		vorpal
		.command('policy create <policyName>', 'Create a new Policy')
		.action(async (args, callback) => {
			try {
				if(APIProxyHelper.existsPolicy(args.policyName)) {
					global.output.error("Policiy exists!!");
				} else {
					let vorpal = this;
					let result = await Command.getListPolicies();

					if(result.policyName == 'Access Control') {
						let accessControl = new TagFactory("AccessControl");
						let xml = await accessControl.initQuestion(vorpal, args.policyName);
						APIProxyHelper.addPolicy(args.policyName);
						fs.writeFileSync(`./${global.actualRevision}/apiproxy/policies/${args.policyName}.xml`, xml, { encoding: 'utf8'});
						await Command.openFile(`./${global.actualRevision}/apiproxy/policies/${args.policyName}.xml`);
					} else {

						console.log(result.policyFile);

						let content = fs.readFileSync(result.policyFile, 'utf8');
						APIProxyHelper.addPolicy(args.policyName);

						let policyJson = fromXML(content);
						let obj = _.filter(Object.keys(policyJson), (item) => item != "?");
						let type = obj[0];
						policyJson[type]["@name"] = args.policyName;
						content = toXML(policyJson, null, 2);

						fs.writeFileSync(`./${global.actualRevision}/apiproxy/policies/${args.policyName}.xml`, content, { encoding: 'utf8'});
						await Command.openFile(`./${global.actualRevision}/apiproxy/policies/${args.policyName}.xml`);	
					}
				}
			} catch(e) {
				global.output.error(e);
			} finally {
				callback();
			}
		});
	}
}

module.exports = Policy;