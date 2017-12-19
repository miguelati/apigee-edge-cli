const fs = require("fs-plus");
const SwaggerParser = require('swagger-parser');
const fromXML = require("from-xml").fromXML;
const toXML = require("to-xml").toXML;
const Table = require('cli-table2');
const _ = require("lodash");
const Command = require("../classes/core/Command");
const openInEditor = require('open-in-editor');
const FlowDrawer = require("../classes/drawer/Flow.js");

class Flow {
	static injectCommand(vorpal) {
		vorpal
		.command('flow <flowName>', 'Show the flow')
		.autocomplete({
			data: function (input, callback) {
				let only = vorpal.ui.input();
				if(only.match(/(\-p |\-\-proxyEndpoint )([0-9A-Za-z]+) /g) === null) {
					callback([]);
				} else {
					let match = only.match(/^flow --proxyEndpoint (\w+) (\w*)/);
					if(input.indexOf(" ") === -1) {
						let autocomplete = Command.getObject(global.localStorage.getItem(`proxy.${match[1]}.flows.nameFlows`));
						let tmpResult = Command.verifyArray(autocomplete);
						let result = tmpResult.map((item) => (item.indexOf(" ") === -1) ? item : `"${item}"`);
						if(!_.isUndefined(match[2]) && result.indexOf(match[2]) > -1) {
							callback([]);
						} else {
							callback(result);		
						}
					} else {
						callback([]);
					}
				}
			}
		})
		.option('-p, --proxyEndpoint <proxyEndpointName>', 'ProxyEndpoint Name of the flow', function(){
			let autocomplete = Command.getObject(global.localStorage.getItem('apiproxy.proxyEndpoints'));
			let result = Command.verifyArray(autocomplete);
			return result.map((item) => (item.indexOf(" ") === -1) ? item : `"${item}"`);
		})
		.action(function(args, callback) {
			let requestAux = Command.getObject(global.localStorage.getItem(`proxy.${args.options.proxyEndpoint}.flows.${args.flowName}.request`));
			let request = Command.verifyArray(requestAux);

			let responseAux = Command.getObject(global.localStorage.getItem(`proxy.${args.options.proxyEndpoint}.flows.${args.flowName}.response`));
			let response = Command.verifyArray(responseAux);

			console.log(FlowDrawer.draw("request", request.map((item) => item.name)));
			console.log(FlowDrawer.draw("response", response.map((item) => item.name)));
  			
			callback();
		});

		vorpal
		.command('flow edit <flowName>', 'Show the flow')
		.autocomplete({
			data: function (input, callback) {
				let only = vorpal.ui.input();
				if(only.match(/(\-p |\-\-proxyEndpoint )([0-9A-Za-z]+) /g) === null) {
					callback([]);
				} else {
					let match = only.match(/^flow edit --proxyEndpoint (\w+) (\w*)/);
					if(input.indexOf(" ") === -1) {
						let autocomplete = Command.getObject(global.localStorage.getItem(`proxy.${match[1]}.flows.nameFlows`));
						let tmpResult = Command.verifyArray(autocomplete);
						let result = tmpResult.map((item) => (item.indexOf(" ") === -1) ? item : `"${item}"`);
						if(!_.isUndefined(match[2]) && result.indexOf(match[2]) > -1) {
							callback([]);
						} else {
							callback(result);		
						}
					} else {
						callback([]);
					}
				}
			}
		})
		.option('-p, --proxyEndpoint <proxyEndpointName>', 'ProxyEndpoint Name of the flow', function(){
			let autocomplete = Command.getObject(global.localStorage.getItem('apiproxy.proxyEndpoints'));
			let result = Command.verifyArray(autocomplete);
			return result.map((item) => (item.indexOf(" ") === -1) ? item : `"${item}"`);
		})
		.action(function(args, callback) {
			let proxyEndpointContent = fs.readFileSync(`./apiproxy/proxies/${args.options.proxyEndpoint}.xml`, 'utf8');
			let json = fromXML(proxyEndpointContent);
			let content = {};

			for(let index in json.ProxyEndpoint.Flows.Flow) {
				if(json.ProxyEndpoint.Flows.Flow[index]["@name"] == args.flowName) content = json.ProxyEndpoint.Flows.Flow[index];
			}

			let xml = toXML({Flow: content}, null, 2)
			let fileName = `./.tmpWatcher/proxyEndpoint_${args.options.proxyEndpoint}_flow_${args.flowName}.xml`;

			fs.writeFileSync(fileName, xml, { encoding: 'utf8'});

			Flow.verifyEditor(this, function(editorName) {
				let editor = openInEditor.configure({
				  editor: editorName
				}, function(err) {
				  console.error('Something went wrong: ' + err);
				});

				editor.open(`${fileName}:0:0`)
				.then(function() {
					console.log(global.chalk.green(`${args.flowName} was opened!`));
					callback();
				}, function(err) {
					console.error(global.chalk.red('Something went wrong: ' + err));
					callback();
				});
			});

			
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

module.exports = Flow;