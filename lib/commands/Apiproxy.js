const fs = require("fs-plus");
const SwaggerParser = require('swagger-parser');
const archiver = require('archiver');
const CLI = require("clui");
const Spinner = CLI.Spinner;
const rimraf = require("rimraf");
const fromXML = require("from-xml").fromXML;
const Table = require('cli-table2');
const _ = require("lodash");
const Command = require("../classes/core/Command");
const APIProxyHelper = require("../classes/core/helpers/APIProxy");
const APIProxyGenerate = require('../classes/generates/APIProxy');
const path = require("path");
const Preferences = require("preferences");
const ApiProxyRest = require("../classes/apigee/ApiProxyRest");
const zipper = require('zip-local');
const Enviroment = require('../classes/core/Enviroment');
const gitDiff = require('git-diff');

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
		.command('apiproxy change')
		.action((args, callback) => {
			vorpal.activeCommand.prompt({type: 'list', name: 'revisionNumber', message: 'Select revision: ', choices: Enviroment.getAllRevisionsDownloaded()}, (result) => {
				Enviroment.changeRevision(result.revisionNumber, vorpal);
				callback();
			});
		});

		vorpal
		.command('apiproxy compare')
		.action((args, callback) => {
			let revisions = Enviroment.getAllRevisionsDownloaded();
			if(revisions.length > 1) {
				let prompts = [
				{type: 'list', name: 'revisionNumberA', message: 'Select revision A: ', choices: revisions},
				{type: 'list', name: 'revisionNumberB', message: 'Select revision B: ', choices: revisions}
				];
				vorpal.activeCommand.prompt(prompts, (result) => {
					let dircompare = require('dir-compare');
					let options = {compareSize: true};
					let path1 = `./${result.revisionNumberA}/apiproxy`;
					let path2 = `./${result.revisionNumberB}/apiproxy`;
					let res = dircompare.compareSync(path1, path2, options);

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

						if(state !== '==') {
							differences.push({file: `${name1} ${state} ${name2}`, index: index});
						}
					}

					

					vorpal.activeCommand.prompt({type: 'list', name: 'selected', message: 'select a file to compare or cancel:', choices: differences.map((item) => item.file)}, (result) => {
						if(result.selected == 'Cancel') {
							callback();	
						} else {
							let indexOf = _.findIndex(differences, o =>  o.file == result.selected);
							let entry = res.diffSet[differences[indexOf].index];
							
							let fileA = fs.readFileSync(`${entry.path1}/${entry.name1}`, 'utf8');
							let fileB = fs.readFileSync(`${entry.path2}/${entry.name2}`, 'utf8');
							
							var diff = gitDiff(fileA, fileB, {color: true, flags: '--diff-algorithm=minimal --ignore-all-space'});
							
							console.log(diff);
							callback();	
						}
					});
				});	
			} else {
				global.output.error("You need at least 2 revisions to compare");
				callback();
			}
		});



		vorpal
		.command('apiproxy download <apiproxyName> [revisionNumber]', 'Download apiproxy from apigee.com')
		.action((args, callback) => {
			Command.getApigeeData(vorpal.activeCommand, async () => {

				var countdown = new Spinner(global.chalk.blue(`Get all revisions number to verify from apigee.com... `), ['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷']);
				try {
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
					
					ApiProxyRest.export({name: args.apiproxyName, revision: args.revisionNumber, path: zipFile}, global.prefs.apigee, (error) => {
						if(!error) {
							try {

								let pathRevision = `./${args.revisionNumber}/`;
								rimraf.sync(pathRevision);
								fs.makeTreeSync(pathRevision);
								zipper.sync.unzip(zipFile).save(pathRevision);

								fs.unlinkSync(zipFile);

								if(fs.existsSync(`./${args.revisionNumber}/apiproxy`)) {
									if(global.apiproxyName === 'edge') {
										Enviroment.setRevision(vorpal);
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
						} else {
							countdown.stop();
							global.output.error("Can't download '"+ zipFile +"'");
							callback();
						}
					});
				} catch(e) {
					countdown.stop();
					global.output.error(e);
					callback();
				}
			});
		});

		vorpal
		.command('apiproxy load', 'Load from swagger file')
		.action((args, callback) => {
			
			if(fs.existsSync(`./${global.actualRevision}/apiproxy`)) {
				global.output.error("ApiProxy folder exists");
				callback();
			} else {
				ApiProxy.existSwagger(vorpal.activeCommand, (swagger) => {
					if(swagger === false) {
						global.output.red("You must create a swagger file or download the Apiproxy");
						callback();
					} else {
						ApiProxy.parseSwagger(swagger, (title) => {
							if(title !== null) {
								vorpal.activeCommand.delimiter(global.chalk.green(title + "$"));
							}
							callback();
						});
					}
				});
			}
		});

		vorpal
		.command('apiproxy rewrite', 'Rewrite all xml files from swagger')
		.action((args, callback) => {
			if(fs.existsSync(`./${global.actualRevision}/apiproxy`)) {

				vorpal.activeCommand.prompt({
				      type: 'confirm',
				      name: 'continue',
				      default: false,
				      message: 'That sounds like a really bad idea. Continue?',
				    }, function(result){
						if (!result.continue) {
							global.output.success("Ok!");
							callback();
						} else {
							ApiProxy.existSwagger(vorpal.activeCommand, (swagger) => {
								if(swagger === false) {
									global.output.error("You must create a swagger file or download the Apiproxy");
									callback();
								} else {
									ApiProxy.parseSwagger(swagger, (title) => {
										if(title !== null) {
											global.output.success('was rewrited!');
											vorpal.activeCommand.delimiter(global.chalk.green(title + "$"));
										}
										callback();
									});
								}
							});
						}
					});
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
			Command.showTable([], [100], policies.map((item) => [item]));

			callback();
		});

		vorpal
		.command('apiproxy targetEndpoint', 'Get all Target Endpoints')
		.action((args, callback) => {
			
			let targetEndpoints = APIProxyHelper.getTargetEndpoints();
			Command.showHeaderApiproxy();
			Command.showTable([], [100], targetEndpoints.map((item) => [item]));

			callback();
		});

		vorpal
		.command('apiproxy proxyEndpoint', 'Get all Proxy Endpoints')
		.action((args, callback) => {

			let proxyEndpoints = APIProxyHelper.getProxyEndpoints();
			
			Command.showHeaderApiproxy();
			Command.showTable([], [100], proxyEndpoints.map((item) => [item]));

			callback();
		});

		vorpal
		.command('apiproxy upload', 'Upload the APIProxy to apigee.com')
		.action((args, callback) => {
			Command.getApigeeData(vorpal.activeCommand, () => {
				var countdown = new Spinner(global.chalk.blue(`Prepare zip file to apigee.com... `), ['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷']);
				try {
					countdown.start();
					
					ApiProxy.createZip(`./${global.actualRevision}/apiproxy/`, './apiproxy.zip', async (error) => {
						if(error == null && fs.existsSync('./apiproxy.zip')) {
							try {
								let apiproxyHelper = new APIProxyHelper();
								let info = apiproxyHelper.getInfo();
								countdown.message(global.chalk.blue(`Upload APIProxy ${info.name} to apigee.com...`))
								let response = await ApiProxyRest.update({name: info.name, action: 'validate', file: "apiproxy.zip"}, global.prefs.apigee);

								fs.unlinkSync('./apiproxy.zip');
								APIProxyHelper.changeRevision(_.parseInt(info.revision) + 1);

								countdown.stop();
								global.output.success(`APIProxy was uploaded. ${response.contextInfo}`);
								callback();
							} catch(e) {
								countdown.stop();
								global.output.error(e);
								callback();
							}
						} else {
							countdown.stop();
							global.output.error(e);
							callback();
						}	
					});
				} catch(e) {
					countdown.stop();
					global.output.error(e);
					callback();
				}
			});
		});
	}

	static createZip(path, file, callback) {
		var output = fs.createWriteStream(`./${file}`);
		var archive = archiver('zip');

		output.on('close', () => callback(null));
		archive.on('error', (err) => callback(error));
		archive.pipe(output);
	    archive
		.directory(path, 'apiproxy')
		.finalize()
	}

	static parseSwagger(file, callback) {
		SwaggerParser
			.validate(file)
			.then(function(api) {
	        	APIProxyGenerate.create(api);
				APIProxyGenerate.generatePostman(api.info.title, api);
				callback(api.info.title);
			})
			.catch(function(err) {
				global.output.error(`Onoes! The API is invalid. ${err.message}`);
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

module.exports = ApiProxy;