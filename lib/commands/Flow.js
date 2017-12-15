const fs = require("fs-plus");
const SwaggerParser = require('swagger-parser');
const fromXML = require("from-xml").fromXML;
const Table = require('cli-table2');
const _ = require("lodash");
const Command = require("../classes/core/Command");
const openInEditor = require('open-in-editor');

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
						let result = Command.verifyArray(autocomplete);
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
		.option('-p, --proxyEndpoint', 'ProxyEndpoint Name of the flow', function(){
			let autocomplete = Command.getObject(global.localStorage.getItem('apiproxy.proxyEndpoints'));
			return Command.verifyArray(autocomplete);
		})
		.action(function(args, callback) {
			
			callback();
		});
	}
}

module.exports = Flow;