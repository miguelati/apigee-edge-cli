const fs = require("fs-plus");
const SwaggerParser = require('swagger-parser');
const fromXML = require("from-xml").fromXML;
const Table = require('cli-table2');
const _ = require("lodash");
const Command = require("../classes/core/Command");
const openInEditor = require('open-in-editor');

class Settings {
	static injectCommand(vorpal) {
		vorpal
		.command('settings <key> [value]', 'Open policy xml')
		.autocomplete(['apigee.username', 'apigee.password', 'apigee.organization', 'editor'])
		.action(function(args, callback) {
			if(args.key === 'editor') {
				Settings.verifyEditor(this, function(){
					console.log(global.chalk.green("editor was changed!"));
					callback();
				})
			//} else if() {
			} else {
				callback();
			}
		});
	}

	static verifyEditor(vorpal, callback) {
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
			callback();
		});
	}
}

module.exports = Settings;