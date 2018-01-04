const fs = require("fs-plus");
const SwaggerParser = require('swagger-parser');
const fromXML = require("from-xml").fromXML;
const Table = require('cli-table2');
const _ = require("lodash");
const Command = require("../classes/core/Command");
const openInEditor = require('open-in-editor');
const dotty = require('dotty');

let settings = [
	'apigee.username',
	'apigee.password',
	'apigee.organization',
	'editor',
	'graph.withNames'
];

class Settings {
	static injectCommand(vorpal) {
		vorpal
		.command('settings', 'Open policy xml')
		.action(function(args, callback) {
			try {
				let rows = [];

				for(let index in settings) {
					rows.push([settings[index], (dotty.exists(`global.prefs.${settings[index]}`)) ? ((settings[index] === 'apigee.password') ? '************' : dotty.get(`global.prefs.${settings[index]}`)) : ""]);	
				}

				Command.showTable(["Keys", "Values"], [50, 100], rows);
			} catch(e) {
				global.output.error(e);
			} finally {
				callback();
			}
		});

		vorpal
		.command('settings save <key>', 'Change setting key')
		.autocomplete(settings)
		.action(function(args, callback) {
			try {
				if(_.indexOf(settings, args.key) === -1) throw "key invalid!!"

				let camelOpt = _.upperFirst(_.camelCase(args.key));
				Settings[`verify${camelOpt}`](this, () => {
					global.output.success(`${args.key} was changed!`);
					callback();
				});
			} catch(e) {
				global.output.error(e);
				callback();
			}
		});
	}

	static verifyApigeeUsername(vorpal, callback) {
		let validation = (value) => value != '';
		
		vorpal.prompt({type: 'input', name: 'username', message: 'Enter your apigee\'s username:', validate: validation}, (result) => {
			if(_.isUndefined(global.prefs.apigee)) global.prefs.apigee = {}; 
			global.prefs.apigee.username = result.username;
			callback();
		});
	}

	static verifyApigeePassword(vorpal, callback) {
		let validation = (value) => value != '';
		
		vorpal.prompt({type: 'password', name: 'password', message: 'Enter your apigee\'s password:', validate: validation}, (result) => {
			if(_.isUndefined(global.prefs.apigee)) global.prefs.apigee = {};
			global.prefs.apigee.password = result.password;
			callback();
		});
	}

	static verifyApigeeOrganization(vorpal, callback) {
		let validation = (value) => value != '';
		
		vorpal.prompt({type: 'input', name: 'organization', message: 'Enter your apigee\'s organization:', validate: validation}, (result) => {
			if(_.isUndefined(global.prefs.apigee)) global.prefs.apigee = {};
			global.prefs.apigee.organization = result.organization;
			callback();
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

	static verifyGraphWithNames(vorpal, callback) {
		vorpal.prompt({type: 'confirm', name: 'withNames', message: 'You want graph flows with names', default: true}, (result) => {
			if(global.prefs.graph === undefined) global.prefs.graph = {};
			global.prefs.graph.withNames = result.withNames;
			callback();
		});
	}
}

module.exports = Settings;