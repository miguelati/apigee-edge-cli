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
		.command('settings', 'Open policy xml')
		.action(function(args, callback) {
			
			var rows = [];

			rows.push(["apigee.username", (global.prefs.apigee && global.prefs.apigee.username) ? global.prefs.apigee.username : ""]);
			rows.push(["apigee.password", (global.prefs.apigee && global.prefs.apigee.password) ? "***************" : ""]);
			rows.push(["apigee.organization", (global.prefs.apigee && global.prefs.apigee.organization) ? global.prefs.apigee.organization : ""]);
	    	rows.push(["editor", (global.prefs.editor) ? global.prefs.editor : ""]);
	    	rows.push(["graph.withNames", (global.prefs.graph !== undefined && global.prefs.graph.withNames !== undefined) ? global.prefs.graph.withNames : ""]);

	    	Command.showTable(["Keys", "Values"], [50, 100], rows)
			
			callback();
		});

		vorpal
		.command('settings save <key>', 'Change setting key')
		.autocomplete(['apigee.username', 'apigee.password', 'apigee.organization', 'editor', 'graph.withNames'])
		.action(function(args, callback) {
			if(args.key === 'editor') {
				Settings.verifyEditor(this, function(){
					console.log(global.chalk.green("editor was changed!"));
					callback();
				})
			} else if(args.key === 'apigee.username') {
				Settings.verifyApigeeUsername(this, function(){
					console.log(global.chalk.green("apigee.username was changed!"));
					callback();
				})
			} else if(args.key === 'apigee.password') {
				Settings.verifyApigeePassword(this, function(){
					console.log(global.chalk.green("apigee.password was changed!"));
					callback();
				})
			} else if(args.key === 'apigee.organization') {
				Settings.verifyApigeeOrganization(this, function(){
					console.log(global.chalk.green("apigee.organization was changed!"));
					callback();
				})
			} else if(args.key === 'graph.withNames') {
				Settings.verifyGraphWithNames(this, function(){
					console.log(global.chalk.green("graph.withNames was changed!"));
					callback();
				})
			} else {
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