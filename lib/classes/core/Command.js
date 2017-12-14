const vorpal = require('vorpal')();
const chalk = vorpal.chalk;
const Table = require('cli-table2');
const _ = require("lodash");

class Command {
	static showHeaderApiproxy() {
		console.log("\n");
		console.log(chalk.gray.bold("ApiProxy: ") + chalk.blue.bold(vorpal.localStorage.getItem('apiproxy.name')));
		console.log(chalk.gray.bold("Revision: ") + chalk.blue.bold(vorpal.localStorage.getItem('apiproxy.revision')));
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
}

module.exports = Command;