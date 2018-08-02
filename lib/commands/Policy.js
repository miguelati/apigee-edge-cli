const fs = require("fs-plus");
const _ = require("lodash");
const Command = require("../classes/core/Command");
const APIProxyHelper = require("../classes/core/helpers/APIProxy");
const ProxyEndpointHelper = require("../classes/core/helpers/ProxyEndpoint"); 
const Autocomplete = require("../classes/core/helpers/Autocomplete");
const TagFactory = require("../classes/xml/TagFactory");
const fromXML = require("from-xml").fromXML;
const toXML = require("to-xml").toXML;
const path = require('path');
const Prompt = require("../classes/core/ui/Prompt");
const ApiProxyRest = require('../classes/apigee/ApiProxyRest');

class Policy {
	static injectCommand(vorpal) {
		vorpal
		.command('policy open <policyName>', 'Open policy xml')
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
		.option('-a, --attach', 'Add the new policy in a Flow')
		.action(async (args, callback) => {
			try {
				if(APIProxyHelper.existsPolicy(args.policyName)) {
					global.output.error("Policiy exists!!");
				} else {
					let xmlFiles = fs.listSync(Command.getTemplatePoliciesPath(), ["xml"]);
					let names = xmlFiles.map((item) => _.startCase(path.basename(item).replace(/.xml$/, '')));
					let xml = "";
					let prompt = new Prompt();
					prompt.list('policyType', 'Select type for the new policy:', names);
					if(args.options.attach) prompt.insertPolicy({
						proxyEndpointName: 'proxyEndpointName',
						flowName: 'flowName',
						index: 'index',
						condition: 'condition',
						type: 'type',
						options: {}
					});
					
					let result = await prompt.show();
					
					if(result.policyType == 'Access Control') {
						let accessControl = new TagFactory("AccessControl");
						xml = await accessControl.initQuestion(vorpal, args.policyName);
						APIProxyHelper.addPolicy(args.policyName);
					} else if(result.policyType == 'Javascript') {
						let javascript = new TagFactory("Javascript");
						xml = await javascript.init(args.policyName);
						APIProxyHelper.addPolicy(args.policyName);
					} else {
						let policyFile = `${Command.getTemplatePoliciesPath()}/${_.kebabCase(result.policyType)}.xml`
						let content = fs.readFileSync(policyFile, 'utf8');
						APIProxyHelper.addPolicy(args.policyName);

						let policyJson = fromXML(content);
						let obj = _.filter(Object.keys(policyJson), (item) => item != "?");
						let type = obj[0];
						policyJson[type]["@name"] = args.policyName;
						xml = toXML(policyJson, null, 2);
					}

					if(args.options.attach) {
						let proxyEndpointHelper = new ProxyEndpointHelper(result.proxyEndpointName);
						proxyEndpointHelper.addStep(result.flowName, args.policyName, result.condition, result.type, result.index);
					}

					fs.writeFileSync(`./${global.actualRevision}/apiproxy/policies/${args.policyName}.xml`, xml, { encoding: 'utf8'});
					await Command.openFile(`./${global.actualRevision}/apiproxy/policies/${args.policyName}.xml`);
				}
			} catch(e) {
				global.output.error(e);
			} finally {
				callback();
			}
		});

		vorpal
		.command('policy attach', 'Attach a Policy in a flow')
		.action(async (args, callback) => {
			try {
				
				let xml = fs.listSync(Command.getTemplatePoliciesPath(), ["xml"]);
				let names = xml.map((item) => _.startCase(path.basename(item).replace(/.xml$/, '')));
				
				let prompt = new Prompt();
				prompt.selectPolicyOfAll('policyName');
				prompt.insertPolicy({
					proxyEndpointName: 'proxyEndpointName',
					flowName: 'flowName',
					index: 'index',
					condition: 'condition',
					type: 'type',
					options: {}
				});
				
				let result = await prompt.show();
				
				let proxyEndpointHelper = new ProxyEndpointHelper(result.proxyEndpointName);
				proxyEndpointHelper.addStep(result.flowName, result.policyName, result.condition, result.type, result.index);

				global.output.success(`The policy ${result.policyName} was attached in the flow ${result.flowName}`);
				
			} catch(e) {
				global.output.error(e);
			} finally {
				callback();
			}
		});

		vorpal
		.command('policy update <policyName>', 'Upload policy to apigee')
		.autocomplete(Autocomplete.getPolicies())
		.action(async (args, callback) => {
			try {
				if(APIProxyHelper.existsPolicy(args.policyName)) {
					await Policy.processPolicy('update', args.policyName);
				} else 
					global.output.error(`Policy ${args.policyName} doesn't exists!!`);
			} catch(e) {
				global.output.error(e);
			} finally {
				callback();
			}
		});

	}

	static async processPolicy(type, policyName) {
		try {
			let body = fs.readFileSync(`./${global.actualRevision}/apiproxy/policies/${policyName}.xml`, 'utf8');
			let info = APIProxyHelper.getInfo();
			let response = await ApiProxyRest[`${type}Policy`]({name: info.name, revision: info.revision, body: body, policyName: policyName}, global.prefs.apigee);
			
			let apiProxyNameWithColor = global.chalk.yellow(info.name); 
			let policyNameWithColor = global.chalk.yellow(policyName);
			global.output.success(`Policy ${policyNameWithColor} was ${type}d in APIProxy ${apiProxyNameWithColor}`);
		} catch(e) {
			global.output.error(e);
		}
	}
}

module.exports = Policy;