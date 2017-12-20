const fs = require("fs-plus");
const SwaggerParser = require('swagger-parser');
const fromXML = require("from-xml").fromXML;
const Table = require('cli-table2');
const _ = require("lodash");
const Command = require("../classes/core/Command");
const openInEditor = require('open-in-editor');
const TagFactory = require("../classes/xml/TagFactory");
const APIProxyHelper = require("../classes/core/helpers/APIProxy");

class New {
	static injectCommand(vorpal) {
		this._vorpalSessionId = vorpal.session.id;
		vorpal
		.command('new targetEndpoint <targetEndpointName>', 'Create new policy xml')
		.action(function(args, callback) {
			if(APIProxyHelper.existsTargetEndpoint(args.targetEndpointName)) {
				console.log(global.chalk.red("TargetEndpoint exists!!"));
				callback();
			} else {
				let nodeFiles = fs.listSync("./apiproxy/resources/node/", ["js"]);
				nodeFiles.unshift("< new js file >");

				let questions = [
					{type: 'list', name: 'type', message: 'Select type:', choices: ['HTTPTargetConnection', 'ScriptTarget', 'LocalTargetConnection']},
					{type: 'input', name: 'url', message: 'Enter the url:', when: (answer) => answer.type == "HTTPTargetConnection"},
					{type: 'list', name: 'script', message: 'Select your script:', choices: nodeFiles, when: (answer) => answer.type === "ScriptTarget" && nodeFiles.length > 1},
					{type: 'input', name: 'newScript', message: 'enter the new script:', when: (answer) => answer.type === "ScriptTarget" && (nodeFiles.length == 1 || answer.script == "< new js file >")},
					{type: 'list', name: 'localTargetType', message: 'Select type:', choices: ['Path', 'Apiproxy\'s name'], when: (answer) => answer.type === "LocalTargetConnection"},
					{type: 'input', name: 'apiProxyName', message: 'Enter the Apiproxy\'s name:', when: (answer) => answer.type === "LocalTargetConnection" && answer.localTargetType == 'Apiproxy\'s name'},
					{type: 'input', name: 'proxyEndpointName', message: 'Enter the ProxyEndpoint\'s name:', when: (answer) => answer.type === "LocalTargetConnection" && answer.localTargetType == "Apiproxy\'s name"},
					{type: 'input', name: 'path', message: 'Enter the Path:', when: (answer) => answer.type === "LocalTargetConnection" && answer.localTargetType == "Path"}
				];

				this.prompt(questions, function(result){
					let targetEndpoint = new TagFactory("TargetEndpoint");
					if(result.type === "HTTPTargetConnection") {
						targetEndpoint.createEmptyWithHTTPTargetConnection(result.url);
					} else if(result.type === "ScriptTarget") {
						if(result.script == "< new js file >") {
							fs.writeFileSync(`./apiproxy/resources/node/${result.newScript}.js`, "", { encoding: 'utf8'});
							targetEndpoint.createEmptyWithScriptTarget(result.newScript);
						} else {
							targetEndpoint.createEmptyWithScriptTarget(result.script);
						}
					} else if(result.type === "LocalTargetConnection") {
						targetEndpoint.createEmptyLocalTargetConnection({path: result.path, apiproxy: result.apiProxyName, proxyEndpoint: result.proxyEndpointName});
					}
					
					APIProxyHelper.addTargetEndpoint(args.targetEndpointName);

					fs.writeFileSync(`./apiproxy/targets/${args.targetEndpointName}.xml`, targetEndpoint.toXml(), { encoding: 'utf8'});

					console.log(global.chalk.green(`TargetEndpoint ${args.targetEndpointName} was created.`));
					callback();
				});
			}
		});
	}

	static verifyEditor(vorpal, callback) {
		if(_.isUndefined(global.prefs.editor)) {
			let validation = (value) => value != '';

			let listEditors = {
				'Sublime Text': 'sublime',
				'Atom Editor': 'atom',
				'Visual Studio Code': 'code',
				'WebStorm' : 'webstorm',
				'PhpStorm' : 'phpstorm',
				'IDEA 14 CE': 'idea14ce',
				'Vim (via Terminal, Mac OS only)': 'vim',
				'Emacs (via Terminal, Mac OS only)': 'emacs',
				'Visual Studio': 'visualstudio'
			};

			
			vorpal.prompt({type: 'list', name: 'editor', message: 'Select your editor: ', choices: Object.keys(listEditors), validate: validation}, (result) => {
				global.prefs.editor = listEditors[result.editor];
				callback(listEditors[result.editor]);
			});
		} else {
			callback(global.prefs.editor);	
		}
	}
}

module.exports = New;