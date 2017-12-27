const Table = require('cli-table2');
const _ = require("lodash");
const openInEditor = require('open-in-editor');
const path = require("path");
const fs = require('fs-plus');

class Command {
	static showHeaderApiproxy() {
		console.log("\n");
		console.log(global.chalk.gray.bold("ApiProxy: ") + global.chalk.blue.bold(global.localStorage.getItem('apiproxy.name')));
		console.log(global.chalk.gray.bold("Revision: ") + global.chalk.blue.bold(global.localStorage.getItem('apiproxy.revision')));
		console.log("\n");
	}

	static showTable(headers, cols, rows) {

		var table = new Table({
    	    head: headers
    	  , colWidths: cols
    	});

    	table.push.apply(table, rows)

    	console.log(table.toString());
	}

	static getObject(value) {
		try {
			return JSON.parse(value);
		} catch(e) {
			return '';
		}
	}

	static verifyArray(value) {
		if(_.isArray(value)) {
			return value;
		} else if(_.isString(value) && value === '') {
			return [];
		} else {
			return [value];
		}
	}

	static getArray(value, properties) {
		if(_.isArray(value)){
			return value.map((item) => {
				if(_.isString(properties)) {
					return item[properties];
				} else if(_.isArray(properties)) {
					let obj = {};
					for(let index in properties) obj[properties[index]] = item[properties[index]];
					return obj;
				} else if(properties.length == 0) {
					return item;
				}
			});
		} else {
			return [];
		}
	}

	static showArray(value) {
		let concatComma = (previeous, actual, index, stack) => {
			if (previeous == "") {
				return actual;
			} else {
				return previeous + ", " + actual;
			}
		};
		if(Array.isArray(value)) {
			return value.reduce(concatComma, "");
		} else {
			return value;
		}
	}

	static openFile(vorpal, fileName, callback) {
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
				Command.openInEditor(fileName, callback);				
			});
		} else {
			Command.openInEditor(fileName, callback);
		}
	}

	static openInEditor(fileName, callback) {
		let editor = openInEditor.configure({
		  editor: global.prefs.editor
		}, function(err) {
		  global.output.error('Something went wrong: ' + err);
		});

		editor.open(`${fileName}:0:0`)
		.then(function() {
			global.output.success(`${fileName} was opened!`)
			callback();
		}, function(err) {
			global.output.error(`Something went wrong: ${err}`);
			callback();
		});
	}

	static getApigeeData(vorpal, callback) {
		let validation = (value) => value != '';
		let questions = [];
		questions.push({type: 'input', name: 'organization', message: 'Organization\'s name: ', validate: validation, when: () => global.prefs.apigee === undefined || global.prefs.apigee.organization === undefined});
		questions.push({type: 'input', name: 'username', message: 'Username: ', validate: validation, when: () => global.prefs.apigee === undefined || global.prefs.apigee.username === undefined});
		questions.push({type: 'password', name: 'password', message: 'Password: ', validate: validation, when: () => global.prefs.apigee === undefined || global.prefs.apigee.password === undefined});
		vorpal.prompt(questions, (result) => {
			if(!global.prefs.apigee) global.prefs.apigee = {};
			for(let key in result) {
				global.prefs.apigee[key] = result[key];
			}
			callback();
		});
	}

	static getTemplatePath() {
		return `${path.dirname(fs.realpathSync(__filename+ '/../../../'))}/templates/xml`;
	}

	static getTemplatePoliciesPath() {
		return `${Command.getTemplatePath()}/policies`;
	}

	static getListPolicies(vorpal, callback) {
		let xml = fs.listSync(Command.getTemplatePoliciesPath(), ["xml"]);
		let names = xml.map((item) => _.startCase(path.basename(item).replace(/.xml$/, '')));
		vorpal.prompt({type: 'list', name: 'policy', message: 'Select your policy: ', choices: names}, (result) => {
			callback(`${Command.getTemplatePoliciesPath()}/${_.kebabCase(result.policy)}.xml`);
		});
	}
}

module.exports = Command;