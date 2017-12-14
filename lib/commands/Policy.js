const fs = require("fs-plus");
const SwaggerParser = require('swagger-parser');
const fromXML = require("from-xml").fromXML;
const Table = require('cli-table2');
const _ = require("lodash");
const Command = require("../classes/core/command");
const openInEditor = require('open-in-editor');

class Policy {
	static injectCommand(vorpal) {
		vorpal
		.command('policy <policyName>', 'Open policy xml')
		.autocomplete({
				data: function () {
					let autocomplete = Command.getObject(global.localStorage.getItem('apiproxy.policies'));
					return Command.verifyArray(autocomplete);
				}
		})
		.action(function(args, callback) {
			Policy.verifyEditor(this, (editorName) => {
				let editor = openInEditor.configure({
				  editor: editorName
				}, function(err) {
				  console.error('Something went wrong: ' + err);
				});

				editor.open('./apiproxy/policies/'+ args.policyName +'.xml:0:0')
				.then(function() {
					console.log(global.chalk.green('./apiproxy/policies/'+ args.policyName +'.xml was opened!'));
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

module.exports = Policy;