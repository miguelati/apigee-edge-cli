const fs = require("fs-plus");
const SwaggerParser = require('swagger-parser');
const CLI = require("clui");
const Spinner = CLI.Spinner;
const rimraf = require("rimraf");
const fromXML = require("from-xml").fromXML;
const Table = require('cli-table2');
const _ = require("lodash");
const Command = require("../classes/core/Command");
const APIProxyHelper = require("../classes/core/helpers/APIProxy");
const ProxyEndpointHelper = require("../classes/core/helpers/ProxyEndpoint");
const TargetEndpointHelper = require("../classes/core/helpers/TargetEndpoint");
const PolicyHelper = require("../classes/core/helpers/Policy");
const APIProxyGenerate = require('../classes/generates/APIProxy');
const path = require("path");
const Preferences = require("preferences");
const ApiProxyRest = require("../classes/apigee/ApiProxyRest");
const Zipper = require('../classes/core/helpers/Zipper');
const Enviroment = require('../classes/core/Enviroment');
const gitDiff = require('git-diff');
const Prompt = require('../classes/core/ui/Prompt');

class ApiProxy {
	static injectCommand(vorpal) {
		vorpal
		.command('apiproxy', 'Information of actual apiproxy')
		.action((args, callback) => {
			try {
				var rows = [];
				let info = APIProxyHelper.getInfo();

				rows.push(["DisplayName", info.displayName]);
				rows.push(["Basepaths", (_.isArray(info.basepaths)) ? info.basepaths.join() : info.basepaths]);
				rows.push(["CreatedAt", info.createdAt.display]);
				rows.push(["CreatedBy", info.createdBy]);
				rows.push(["LastModifiedAt", info.lastModifiedAt.display]);
				rows.push(["LastModifiedBy", info.lastModifiedBy]);
				rows.push(["Policies", APIProxyHelper.getPolicies().join()]);
				rows.push(["ProxyEndpoints", APIProxyHelper.getProxyEndpoints().join()]);
				rows.push(["TargetEndpoints", APIProxyHelper.getTargetEndpoints().join()]);

				Command.showHeaderApiproxy();
				Command.showTable([], [30, 70], rows)

				callback();
			} catch(e) {
				global.output.error(e);
				callback();
			}
		});

		vorpal
		.command('apiproxy deployments')
		.action(async (args, callback) => {
			var countdown = new Spinner(global.chalk.blue(`Get all apiproxy information from apigee.com... `), ['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷']);
			try {
				countdown.start()
				let info = APIProxyHelper.getInfo();
				let deploymentsInfo = await ApiProxyRest.getDeployments({name: info.name}, global.prefs.apigee);
				countdown.stop();
				let rows = [];
				
				for(let index in deploymentsInfo['environment']) {
					let state = _.get(deploymentsInfo['environment'][index], 'revision[0].state');
					let color = (state === 'deployed') ? "green" : "yellow"
					rows.push([deploymentsInfo['environment'][index].name, global.chalk[color](_.get(deploymentsInfo['environment'][index], 'revision[0].name'))]);
				}

				Command.showTable([], [50,50], rows);
			} catch(e) {
				countdown.stop();
				global.output.error(e);
			} finally {
				callback();
			}
		});

		vorpal
		.command('apiproxy deploy')
		.option('-f,--force', 'Force first a undeploy')
		.action(async (args, callback) => {
			var countdown = new Spinner(global.chalk.blue(`Get all apiproxy's revisions from apigee.com... `), ['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷']);
			try {
				countdown.start()
				let info = APIProxyHelper.getInfo();
				let revisions = await ApiProxyRest.getRevisions({apiproxyName: info.name}, global.prefs.apigee);
				countdown.stop();

				let prompt = new Prompt();
				prompt.list('revision', 'Select a revision', revisions);
				prompt.list('environment', 'Select a environment to deploy', ['prod', 'test']);

				let result = await prompt.show();

				countdown.message(global.chalk.blue(`Undeploy ${info.name}'s revision #${result.revision} to ${result.environment} in apigee.com... `));
				countdown.start();
				
				if(args.options.force) {
					let deploymentsInfo = await ApiProxyRest.getDeployments({name: info.name}, global.prefs.apigee);
					let enviromentIndex = _.findIndex(deploymentsInfo['environment'], (item) => item.name == result.environment);
					let oldRevision = _.get(deploymentsInfo['environment'][enviromentIndex], 'revision[0].name');

					await ApiProxyRest.setUndeploy({name: info.name, revision: oldRevision, environment: result.environment}, global.prefs.apigee);
				}

				countdown.message(global.chalk.blue(`Deploy ${info.name}'s revision #${result.revision} to ${result.environment} in apigee.com... `));
				
				await ApiProxyRest.setDeploy({name: info.name, revision: result.revision, environment: result.environment}, global.prefs.apigee);
				countdown.stop();
				
				global.output.success(`${info.name}'s revision #${result.revision} was deployed in ${result.environment}`);

			} catch(e) {
				countdown.stop();
				global.output.error(e);
			} finally {
				callback();
			}
		});

		vorpal
		.command('apiproxy undeploy')
		.action(async (args, callback) => {
			var countdown = new Spinner(global.chalk.blue(`Get all apiproxy information from apigee.com... `), ['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷']);
			try {
				countdown.start()
				let info = APIProxyHelper.getInfo();
				let deploymentsInfo = await ApiProxyRest.getDeployments({name: info.name}, global.prefs.apigee);

				countdown.stop();
				let prompt = new Prompt();
				prompt.list('environment', 'Select a environment to deploy', ['prod', 'test']);

				let result = await prompt.show();

				let indexEnv = _.findIndex(deploymentsInfo['environment'], (item) => item.name === result.environment);
				let revision = _.get(deploymentsInfo['environment'][indexEnv], 'revision[0].name')

				countdown.message(global.chalk.blue(`Undeploy ${info.name}'s revision #${revision} to ${result.environment} in apigee.com... `));
				countdown.start();
				
				await ApiProxyRest.setUndeploy({name: info.name, revision: revision, environment: result.environment}, global.prefs.apigee);
				countdown.stop();
				
				global.output.success(`${info.name}'s revision #${revision} was undeployed in ${result.environment}`);

			} catch(e) {
				countdown.stop();
				global.output.error(e);
			} finally {
				callback();
			}
		});

		vorpal
		.command('apiproxy change')
		.action(async (args, callback) => {
			try {
				let prompt = new Prompt();
				prompt.list('revisionNumber', 'Select revision:', Enviroment.getAllRevisionsDownloaded());
				let result = await prompt.show();
				Enviroment.changeRevision(result.revisionNumber, vorpal);
				callback();
			} catch(e) {
				global.output.error(e);
			}
		});

		vorpal
		.command('apiproxy compare')
		.action(async (args, callback) => {
			try {
				let revisions = Enviroment.getAllRevisionsDownloaded();
				if(revisions.length > 1) {
					let prompt = new Prompt();
					prompt.list('revisionNumberA', 'Select revision A:', revisions);
					prompt.list('revisionNumberB', 'Select revision B:', revisions);
					let result = await prompt.show();

					// DIRECTORIES DIFF
					let dircompare = require('dir-compare');
					let res = dircompare.compareSync(`./${result.revisionNumberA}/apiproxy`, `./${result.revisionNumberB}/apiproxy`, {compareSize: true});

					let rows = [];

					rows.push(['Equals', res.equal]);
					rows.push(['Distinct', res.distinct]);
					rows.push([`Revision ${result.revisionNumberA}`, res.left]);
					rows.push([`Revision ${result.revisionNumberB}`, res.right]);
					rows.push(['Differences', res.differences]);

					Command.showTable([], [50,50], rows);

					let differences = [{file: 'Cancel', index: null}];
					for(let index in res.diffSet) {
						let entry = res.diffSet[index];
						let state = {
						    'equal' : '==',
						    'left' : '->',
						    'right' : '<-',
						    'distinct' : '<>'
						}[entry.state];
						let name1 = `${entry.path1}/${entry.name1}`;
						let name2 = `${entry.path2}/${entry.name2}`;

						if(state !== '==') differences.push({file: `${name1} ${state} ${name2}`, index: index});
					}

					prompt.clean();
					prompt.list('selected', 'select a file to compare or cancel:', differences.map((item) => item.file));
					result = await prompt.show();

					if(result.selected == 'Cancel') callback();	
					else {
						let indexOf = _.findIndex(differences, o =>  o.file == result.selected);
						let entry = res.diffSet[differences[indexOf].index];
						
						let fileA = fs.readFileSync(`${entry.path1}/${entry.name1}`, 'utf8');
						let fileB = fs.readFileSync(`${entry.path2}/${entry.name2}`, 'utf8');
						
						var diff = gitDiff(fileA, fileB, {color: true, flags: '--diff-algorithm=minimal --ignore-all-space'});
						
						global.output.log(diff);
					}
				} else {
					throw "You need at least 2 revisions to compare";
				}
			} catch(e) {
				global.output.error(e);
			} finally {
				callback();
			}
		});

		vorpal
		.command('apiproxy download <apiproxyName> [revisionNumber]', 'Download apiproxy from apigee.com')
		.action(async (args, callback) => {
			var countdown = new Spinner(global.chalk.blue(`Get all revisions number to verify from apigee.com... `), ['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷']);

			try {
				await Command.getApigeeData(vorpal.activeCommand);

				countdown.start();					
				let allRevisions = await ApiProxyRest.getRevisions({apiproxyName: args.apiproxyName}, global.prefs.apigee);
				
				let firstRevision = 1;
				let lastRevision = _.parseInt(_.last(allRevisions));

				let isLastRevision = false;
				if(args.revisionNumber === undefined || (args.revisionNumber <=  firstRevision && args.revisionNumber >= lastRevision)) {
					args.revisionNumber = lastRevision;
					isLastRevision = true;
				}
				if(args.revisionNumber == lastRevision) isLastRevision = true;
				
				let zipFile = "./"+ args.apiproxyName +"_revision_"+ args.revisionNumber +".zip";
				countdown.message(global.chalk.blue(`Downloading \'${args.apiproxyName}\' revision ${args.revisionNumber} from apigee.com... `));

				let response = await ApiProxyRest.export({name: args.apiproxyName, revision: args.revisionNumber}, global.prefs.apigee);
				fs.writeFileSync(zipFile, response);
				
				let pathRevision = `./${args.revisionNumber}/`;
				rimraf.sync(pathRevision);
				fs.makeTreeSync(pathRevision);
				
				Zipper.uncompress(zipFile, pathRevision);

				fs.unlinkSync(zipFile);

				if(fs.existsSync(`./${args.revisionNumber}/apiproxy`)) {
					if(global.apiproxyName === 'edge') 
						Enviroment.setRevision(vorpal);

					if(fs.existsSync(`./${args.revisionNumber}/apiproxy/resources/node/`) && global.prefs.node.zip) {
						global.watcher.unwatch('apiproxy');
						await Zipper.unzipFolders(`./${args.revisionNumber}/apiproxy/resources/node/`);
						APIProxyHelper.generateResources();
						global.watcher.add('apiproxy', `./${global.actualRevision}/apiproxy/`);
					}

					countdown.stop();
					global.output.success(`Apiproxy ${args.apiproxyName} revision ${args.revisionNumber} was downloaded!`);
					callback();
				} else {
					throw "Can't download apiproxy";
				}
			} catch(e) {
				countdown.stop();
				global.output.error(e);
				callback();
			}
		});

		vorpal
		.command('apiproxy load', 'Load from swagger file')
		.action(async (args, callback) => {
			try {
				if(fs.existsSync(`./${global.actualRevision}/apiproxy`)) {
					throw "ApiProxy folder exists";
				} else {
					let swagger = await ApiProxy.existSwagger(vorpal);
					if(swagger === 'Cancel') throw "Operation cancelled.";
					else if(swagger === false) throw "You must create a swagger file or download the Apiproxy";
					else {
						let title = await ApiProxy.parseSwagger(swagger);
						if(title !== null) Enviroment.setRevision(vorpal);
						else throw "Can't parse swagger in Apiproxy";
					}
				}
			} catch(e) {
				global.output.error(e);
			} finally {
				callback();
			}
		});

		vorpal
		.command('apiproxy rewrite', 'Rewrite all xml files from swagger')
		.action(async (args, callback) => {
			if(fs.existsSync(`./${global.actualRevision}/apiproxy`)) {
				let prompt = new Prompt();
				prompt.confirm('continue', 'That sounds like a really bad idea. Continue?', {default: false});
				let result = await prompt.show();

				if (result.continue) {
					let swagger = await ApiProxy.existSwagger(vorpal);
					if(swagger === false) {
						global.output.red("You must create a swagger file or download the Apiproxy");
						callback();
					} else {
						let title = await ApiProxy.parseSwagger(swagger);
						if(title !== null) {
							global.output.success('was rewrited!');
							vorpal.activeCommand.delimiter(global.chalk.green(title + "$"));
							callback();
						} else {
							global.output.error("Can't rewrite swagger in Apiproxy");
							callback();
						}
					}
				} else {
					global.output.success("Ok!");
					callback();
				}
		  	} else {
		  		global.output.error("Can't rewrite, apiproxy folder doesn't exists!!!");
		  		callback();
		  	}    
		});
	
		vorpal
		.command('apiproxy policies', 'Get all policies')
		.action((args, callback) => {
			
			let policies = APIProxyHelper.getPolicies();
			Command.showHeaderApiproxy();
			Command.showTable([], [50,50], policies.map((item) => {
				let policy = new PolicyHelper(item);
				return [item, global.chalk.yellow(policy.type)]
			}));

			callback();
		});

		vorpal
		.command('apiproxy targetEndpoint', 'Get all Target Endpoints')
		.action((args, callback) => {
			
			let targetEndpoints = APIProxyHelper.getTargetEndpoints();
			let rows = [];

			for(let index in targetEndpoints) {
				let targetEndpointHelper = new TargetEndpointHelper(targetEndpoints[index]);
				let flows = targetEndpointHelper.getFlows();
				rows.push([targetEndpoints[index], `${flows.length}`])
			}

			
			Command.showHeaderApiproxy();
			Command.showTable(['Name' , 'Total Flows'], [50,50], rows);

			callback();
		});

		vorpal
		.command('apiproxy proxyEndpoint', 'Get all Proxy Endpoints')
		.action((args, callback) => {

			let proxyEndpoints = APIProxyHelper.getProxyEndpoints();
			let rows = [];

			for(let index in proxyEndpoints) {
				let proxyEndpointHelper = new ProxyEndpointHelper(proxyEndpoints[index]);
				let flows = proxyEndpointHelper.getFlows();
				rows.push([proxyEndpoints[index], `${flows.length}`])
			}

			
			Command.showHeaderApiproxy();
			Command.showTable(['Name' , 'Total Flows'], [50,50], rows);

			callback();
		});

		vorpal
		.command('apiproxy resources', 'Get all Resources')
		.action((args, callback) => {

			let resources = APIProxyHelper.getResources();
			
			Command.showHeaderApiproxy();
			Command.showTable([], [100], resources.map((item) => [item]));

			callback();
		});

		vorpal
		.command('apiproxy update', 'Update APIProxy\' revison to apigee.com')
		.option('-d, --description <description>', 'Description of APIProxy')
		.action(async (args, callback) => {
			var countdown = new Spinner(global.chalk.blue(`Prepare zip file to apigee.com... `), ['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷']);

			try {
				await Command.getApigeeData(vorpal.activeCommand);

				countdown.start();


				
				if(fs.existsSync(`./${global.actualRevision}/apiproxy/resources/node/`) && global.prefs.node.zip) {
					global.watcher.unwatch('apiproxy');
					await Zipper.zipFolders(`./${global.actualRevision}/apiproxy/resources/node/`);
					APIProxyHelper.generateResources();
				}


				
				await Zipper.compress(`./${global.actualRevision}/apiproxy/`, './apiproxy.zip');

				let apiproxyHelper = new APIProxyHelper();

				if(!_.isEmpty(args.option.description)) apiproxyHelper.changeDescription(args.option.description);
				
				let info = apiproxyHelper.getInfo();
				let wasUndeploy = null;
				if(fs.existsSync(`./${global.actualRevision}/apiproxy/resources/node/`)) {
					countdown.message(global.chalk.blue(`Get deployments of APIProxy ${info.name}...`));
					let deploymentsInfo = await ApiProxyRest.getDeployments({name: info.name}, global.prefs.apigee);
					let indexTestEnv = _.findIndex(deploymentsInfo['environment'], (item) => item.name === 'test');
					let revisionTest = _.get(deploymentsInfo['environment'][indexTestEnv], 'revision[0].name');

					let indexProdEnv = _.findIndex(deploymentsInfo['environment'], (item) => item.name === 'prod');
					let revisionProd = _.get(deploymentsInfo['environment'][indexProdEnv], 'revision[0].name');

					countdown.message(global.chalk.blue(`Undeploy the APIProxy ${info.name}...`));

					if(revisionTest == info.revision) {
						await ApiProxyRest.setUndeploy({name: info.name, revision: info.revision, environment: 'test'}, global.prefs.apigee);
						wasUndeploy = 'test'
					}

					if(revisionProd == info.revison) {
						await ApiProxyRest.setUndeploy({name: info.name, revision: info.revision, environment: 'prod'}, global.prefs.apigee);
						wasUndeploy = 'prod'
					}
				}
				countdown.message(global.chalk.blue(`Upload APIProxy ${info.name} to apigee.com...`))
				
				let response = await ApiProxyRest.update({name: info.name, revision: info.revision, file: "apiproxy.zip"}, global.prefs.apigee);
				
				fs.unlinkSync('./apiproxy.zip');

				if(fs.existsSync(`./${global.actualRevision}/apiproxy/resources/node/`) && global.prefs.node.zip) {
					await Zipper.unzipFolders(`./${global.actualRevision}/apiproxy/resources/node/`);
					APIProxyHelper.generateResources();
					global.watcher.add('apiproxy', `./${global.actualRevision}/apiproxy/`);

					await ApiProxyRest.npm({name: info.name, revision: info.revision, command: 'update'}, global.prefs.apigee);
				}

				if(fs.existsSync(`./${global.actualRevision}/apiproxy/resources/node/`)) {
					//countdown.message(global.chalk.blue(`Running npm update in APIProxy ${info.name}...`))
					//let response = await ApiProxyRest.npm({name: info.name, revision: info.revision, command: 'update'}, global.prefs.apigee);

					countdown.message(global.chalk.blue(`Deploy again in APIProxy ${info.name}...`));
					
					if(wasUndeploy == 'test') {
						await ApiProxyRest.setDeploy({name: info.name, revision: info.revision, environment: 'test'}, global.prefs.apigee);
					}

					if(wasUndeploy == 'prod') {
						await ApiProxyRest.setDeploy({name: info.name, revision: info.revision, environment: 'prod'}, global.prefs.apigee);
					}
				}
				
				countdown.stop();
				global.output.success(`APIProxy ${info.name} was updated. ${response.contextInfo}`);
				callback();
			} catch(e) {
				countdown.stop();
				console.log(e);
				global.output.error(e);
				callback();
			}
		});

		vorpal
		.command('apiproxy upload', 'Upload the APIProxy to apigee.com')
		.action(async (args, callback) => {
			var countdown = new Spinner(global.chalk.blue(`Prepare zip file to apigee.com... `), ['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷']);
			try {
				await Command.getApigeeData(vorpal.activeCommand);

				countdown.start();

				if(fs.existsSync(`./${global.actualRevision}/apiproxy/resources/node/`) && global.prefs.node.zip) {
					global.watcher.unwatch('apiproxy');
					await Zipper.zipFolders(`./${global.actualRevision}/apiproxy/resources/node/`);
					APIProxyHelper.generateResources();
				}

				await Zipper.compress(`./${global.actualRevision}/apiproxy/`, './apiproxy.zip');

				let apiproxyHelper = new APIProxyHelper();
				let info = apiproxyHelper.getInfo();

				let wasUndeploy = null;
				if(fs.existsSync(`./${global.actualRevision}/apiproxy/resources/node/`)) {
					countdown.message(global.chalk.blue(`Get deployments of APIProxy ${info.name}...`));
					let deploymentsInfo = await ApiProxyRest.getDeployments({name: info.name}, global.prefs.apigee);
					let indexTestEnv = _.findIndex(deploymentsInfo['environment'], (item) => item.name === 'test');
					let revisionTest = _.get(deploymentsInfo['environment'][indexTestEnv], 'revision[0].name');

					let indexProdEnv = _.findIndex(deploymentsInfo['environment'], (item) => item.name === 'prod');
					let revisionProd = _.get(deploymentsInfo['environment'][indexProdEnv], 'revision[0].name');

					countdown.message(global.chalk.blue(`Undeploy the APIProxy ${info.name}...`));

					if(revisionTest == info.revision) {
						await ApiProxyRest.setUndeploy({name: info.name, revision: info.revision, environment: 'test'}, global.prefs.apigee);
						wasUndeploy = 'test'
					}

					if(revisionProd == info.revison) {
						await ApiProxyRest.setUndeploy({name: info.name, revision: info.revision, environment: 'prod'}, global.prefs.apigee);
						wasUndeploy = 'prod'
					}
				}

				countdown.message(global.chalk.blue(`Upload APIProxy ${info.name} to apigee.com...`))
				let response = await ApiProxyRest.import({name: info.name, action: 'import', file: "apiproxy.zip"}, global.prefs.apigee);

				fs.unlinkSync('./apiproxy.zip');

				let newRevision = _.parseInt(info.revision) + 1;

				if(fs.existsSync(`./${global.actualRevision}/apiproxy/resources/node/`) && global.prefs.node.zip) {
					await Zipper.unzipFolders(`./${global.actualRevision}/apiproxy/resources/node/`);
					APIProxyHelper.generateResources();
					global.watcher.add('apiproxy', `./${global.actualRevision}/apiproxy/`);					
				}

				if(fs.existsSync(`./${global.actualRevision}/apiproxy/resources/node/`)) {
					//countdown.message(global.chalk.blue(`Running npm update in APIProxy ${info.name}...`))
					//let response = await ApiProxyRest.npm({name: info.name, revision: newRevision, command: 'update'}, global.prefs.apigee);

					countdown.message(global.chalk.blue(`Deploy again in APIProxy ${info.name}...`));
					
					if(wasUndeploy == 'test') {
						await ApiProxyRest.setDeploy({name: info.name, revision: newRevision, environment: 'test'}, global.prefs.apigee);
					}

					if(wasUndeploy == 'prod') {
						await ApiProxyRest.setDeploy({name: info.name, revision: newRevision, environment: 'prod'}, global.prefs.apigee);
					}
				}

				
				APIProxyHelper.changeRevision(newRevision);
				fs.renameSync(`./${global.actualRevision}`, `./${newRevision}`);
				Enviroment.changeRevision(newRevision, vorpal);

								
				countdown.stop();
				global.output.success(`APIProxy was uploaded. ${response.contextInfo}`);
				callback();
			} catch(e) {
				countdown.stop();
				console.log(e);
				global.output.error(e);
				callback();
			}
		});
	}

	static async parseSwagger(file) {
		let api = await SwaggerParser.validate(file);
		
		APIProxyGenerate.create(api);
		APIProxyGenerate.generatePostman(api.info.title, api);
		return api.info.title;
	}

	static async existSwagger(vorpal) {
		let swaggers = fs.listSync("./", ["yaml", "json"]);
		
		if(swaggers.length == 1) {
			return swaggers[0];
		} else {
			swaggers.push("Cancel");
			let prompt = new Prompt();
			prompt.list('swagger', 'Select the swagger file:', swaggers);
			let result = await prompt.show();
			
			return result.swagger;
		}

		return false;
	}
}

module.exports = ApiProxy;