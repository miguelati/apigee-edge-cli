const Table = require('cli-table2');
const _ = require("lodash");
const openInEditor = require('open-in-editor');
const path = require("path");
const fs = require('fs-plus');
const APIProxyHelper = require('./helpers/APIProxy');
const cliSize = require("cli-size");
const Prompt = require('./ui/Prompt');

class Command {
	static showHeaderApiproxy() {
		global.output.log("\n");
		
		let info = APIProxyHelper.getInfo();
		global.output.log(global.chalk.gray.bold("ApiProxy: ") + global.chalk.blue.bold(info.name));
		global.output.log(global.chalk.gray.bold("Revision: ") + global.chalk.blue.bold(info.revision));
		global.output.log("\n");
	}

	static getColumnsWidths(cols) {
		let screen = cliSize();
		let totalCols = screen.columns - 4;
		
		let colsWithds = [];
		for(let index in cols) {
			if(index == (cols.length - 1)) {
				let totalSize = colsWithds.reduce((a, b) => a + b, 0);
				colsWithds.push(totalCols - totalSize);
			} else {
				colsWithds.push(Math.trunc((cols[index] * totalCols) / 100));
			}
		}
		
		return colsWithds;
	}

	static showTable(headers, cols, rows) {
		let colsWidths = Command.getColumnsWidths(cols);

		var table = new Table({
    	    head: headers
    	  , colWidths: colsWidths
    	});

    	table.push.apply(table, rows)

    	global.output.log(table.toString());
	}

	static async openFile(fileName, line = "0:0") {
		try {
			if(_.isUndefined(global.prefs.editor)) {
				let validation = (value) => value != '';
				
				let prompt = new Prompt();
				prompt.selectEditor(editor, {validate: validation});
				let result = await prompt.show()

				global.prefs.editor = result.editor;
			}
			await Command.openInEditor(`${fileName}:${line}`);
			global.output.success(`${fileName} was opened!`)
		} catch(e) {
			global.output.error(`Something went wrong: ${e}`);
		}
	}

	static openInEditor(fileName) {
		let editor = openInEditor.configure({
		  editor: global.prefs.editor
		}, function(err) {
		  global.output.error('Something went wrong: ' + err);
		  return null;
		});

		return editor.open(`${fileName}:0:0`)
	}

	static async getApigeeData() {
		let validation = (value) => value != '';
		let prompt = new Prompt();

		prompt.input('organization', 'Organization\'s name:', {validate: validation, when: () => global.prefs.apigee === undefined || global.prefs.apigee.organization === undefined});
		prompt.input('username', 'Username:', {validate: validation, when: () => global.prefs.apigee === undefined || global.prefs.apigee.username === undefined});
		prompt.password('password', 'Password:', {validate: validation, when: () => global.prefs.apigee === undefined || global.prefs.apigee.password === undefined});

		let result = await prompt.show()

		if(!global.prefs.apigee) global.prefs.apigee = {};
		for(let key in result) global.prefs.apigee[key] = result[key];
	}

	static getTemplatePath() {
		return `${path.dirname(fs.realpathSync(__filename+ '/../../../'))}/templates/xml`;
	}

	static getTemplatePoliciesPath() {
		return `${Command.getTemplatePath()}/policies`;
	}

	static analizeVerbInCondition(condition) {

		if(_.isEmpty(condition)) {
			return global.chalk.white.bgYellow.bold(_.pad("ALL", 12));
		} else if(/request\.verb *(=|Equals|equals|Is|is) *[\"|\']GET[\"|\']/.test(condition)) {
			return global.chalk.white.bgBlue.bold(_.pad("GET", 12));
		} else if (/request\.verb *(=|Equals|equals|Is|is) *[\"|\']POST[\"|\']/.test(condition)) {
			return global.chalk.white.bgGreen.bold(_.pad("POST", 12));
		} else if (/request\.verb *(=|Equals|equals|Is|is) *[\"|\']PUT[\"|\']/.test(condition)) {
			return global.chalk.white.bgMagenta.bold(_.pad("PUT", 12));
		} else if (/request\.verb *(=|Equals|equals|Is|is) *[\"|\']DELETE[\"|\']/.test(condition)) {
			return global.chalk.white.bgRed.bold(_.pad("DELETE", 12));
		} else if (/request\.verb/.test(condition)) {
			return global.chalk.white.bgYellow.bold(_.pad("ALL", 12));
		} else {
			return global.chalk.white.bgWhite.bold(_.pad("COND", 12));
		}
	}

	static analizePathInCondition(condition) {
		let matches = condition.match(/((\\|\/)[a-z0-9\s_@*\-^!#$%&+={}\[\]]+)+/g);
		if(_.isEmpty(matches)) {
			return "";	
		} else {
			return matches.join();
		}
	}

	static async getListPolicies() {
		let xml = fs.listSync(Command.getTemplatePoliciesPath(), ["xml"]);
		let names = xml.map((item) => _.startCase(path.basename(item).replace(/.xml$/, '')));
		
		let prompt = new Prompt();
		prompt.list('policy', 'Select your policy', names);
		let result = await prompt.show();

		return {policyFile: `${Command.getTemplatePoliciesPath()}/${_.kebabCase(result.policy)}.xml`, policyName: result.policy};
	}
}

module.exports = Command;