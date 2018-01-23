const fs = require("fs-plus");
const _ = require("lodash");
const Command = require("../classes/core/Command");
const Enviroment = require('../classes/core/Enviroment');

class Info {
	static injectCommand(vorpal) {
		vorpal
		.command('info', 'Information')
		.action((args, callback) => {
			try {
				let rows = [];
				var pjson = require(`${__dirname}/../../package.json`);
				
				rows.push(['Apigee-edge-cli Version', global.chalk.blue(pjson.version)]);
				if(global.actualRevision === null) {
					rows.push(['Apiproxy name', global.chalk.blue('none')]);
					rows.push(['Apiproxy Revision', global.chalk.blue('nome')]);
				} else {
					rows.push(['Apiproxy name', global.chalk.blue(global.apiproxyName)]);
					rows.push(['Apiproxy actual revision', global.chalk.blue(global.actualRevision)]);
				}
				rows.push(['Apiproxies revisions downloads', global.chalk.blue(Enviroment.getAllRevisionsDownloaded().join())]);
				
				Command.showTable([], [50, 100], rows);
			} catch(e) {
				global.output.error(e);
			} finally {
				callback();
			}
		});
	}
}

module.exports = Info;