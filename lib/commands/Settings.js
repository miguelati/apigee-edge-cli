const fs = require("fs-plus");
const SwaggerParser = require('swagger-parser');
const fromXML = require("from-xml").fromXML;
const Table = require('cli-table2');
const _ = require("lodash");
const Command = require("../classes/core/Command");
const Prompt = require("../classes/core/ui/Prompt");
const openInEditor = require('open-in-editor');

let settings = [
	'apigee.username',
	'apigee.password',
	'apigee.organization',
	'editor',
	'graph.withNames',
	'live.validation',
	'live.upload',
	'node.zip'
];

class Settings {
	static injectCommand(vorpal) {
		vorpal
		.command('settings list', 'Open policy xml')
		.action((args, callback) => {
			try {
				let rows = [];

				for(let index in settings) {
					rows.push([settings[index], (_.has(global.prefs, settings[index])) ? ((settings[index] === 'apigee.password') ? '************' : _.get(global.prefs, settings[index])) : ""]);
				}

				Command.showTable(["Keys", "Values"], [50, 100], rows);
			} catch(e) {
				global.output.error(e);
			} finally {
				callback();
			}
		});

		vorpal
		.command('settings set <key>', 'Change setting key')
		.autocomplete(settings)
		.action(async (args, callback) => {
			try {
				if(_.indexOf(settings, args.key) === -1) throw "key invalid!!"

				let camelOpt = _.upperFirst(_.camelCase(args.key));
				await Settings[`verify${camelOpt}`]();
				global.output.success(`${args.key} was changed!`);
			} catch(e) {
				global.output.error(e);
			} finally {
				callback();
			}
		});
	}

	static async verifyApigeeUsername() {
		let validation = (value) => value != '';

		let prompt = new Prompt();
		prompt.input('username', 'Enter your apigee\'s username:', {validate: validation});
		let result = await prompt.show();

		if(_.isUndefined(global.prefs.apigee)) global.prefs.apigee = {}; 
		global.prefs.apigee.username = result.username;
	}

	static async verifyApigeePassword() {
		let validation = (value) => value != '';

		let prompt = new Prompt();
		prompt.password('password', 'Enter your apigee\'s password:', {validate: validation});
		let result = await prompt.show();

		if(_.isUndefined(global.prefs.apigee)) global.prefs.apigee = {};
		global.prefs.apigee.password = result.password;
	}

	static async verifyApigeeOrganization() {
		let validation = (value) => value != '';

		let prompt = new Prompt();
		prompt.input('organization', 'Enter your apigee\'s organization:', {validate: validation});
		let result = await prompt.show();

		if(_.isUndefined(global.prefs.apigee)) global.prefs.apigee = {};
		global.prefs.apigee.organization = result.organization;
	}

	static async verifyEditor() {
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

		let prompt = new Prompt();
		prompt.list('editor', 'Select your editor:', Object.keys(listEditors), {validate: validation});
		let result = await prompt.show();
		global.prefs.editor = listEditors[result.editor];
	}

	static async verifyGraphWithNames() {
		let prompt = new Prompt();
		prompt.confirm('withNames', 'You want graph flows with names?', {default: true});
		let result = await prompt.show();
		if(global.prefs.graph === undefined) global.prefs.graph = {};
		global.prefs.graph.withNames = result.withNames;
	}

	static async verifyLiveValidation() {
		let prompt = new Prompt();
		prompt.confirm('validation', 'You want live validation?', {default: true});
		let result = await prompt.show();
		if(global.prefs.live === undefined) global.prefs.live = {};
		global.prefs.live.validation = result.validation;
		if(result.validation) global.watcher.add('apiproxy', `./${global.actualRevision}/apiproxy/`);
		else global.watcher.add('apiproxy');
	}

	static async verifyLiveUpload() {
		let prompt = new Prompt();
		prompt.confirm('upload', 'You want live upload?', {default: false});
		let result = await prompt.show();
		// set params
		if(global.prefs.live === undefined) global.prefs.live = {};
		global.prefs.live.upload = result.upload;
		// ask data if need
		await Command.getApigeeData();
	}

	static async verifyNodeZip() {
		let prompt = new Prompt();
		prompt.confirm('zip', 'You want zip in node resource?', {default: false});
		let result = await prompt.show();
		if(global.prefs.node === undefined) global.prefs.node = {};
		global.prefs.node.zip = result.zip;
	}

	static async verifyTemplate() {
		let validation = (value) => value === "" || fs.existsSync(fs.absolute(value));

		let prompt = new Prompt();
		prompt.input('template', 'Enter template\'s path (empty is cancel) :', {validate: validation});
		let result = await prompt.show();

		global.prefs.template = result.template;
	}
}

module.exports = Settings;