const fs = require("fs-plus");
const _ = require("lodash");
const Command = require("../classes/core/Command");
const APIProxyHelper = require("../classes/core/helpers/APIProxy");
const Autocomplete = require("../classes/core/helpers/Autocomplete");
const TagFactory = require("../classes/xml/TagFactory");

class Resource {
	static injectCommand(vorpal) {
		vorpal
		.command('resource node <resourceName>', 'Open resource in node')
		.autocomplete(Autocomplete.getResources('node'))
		.action(function(args, callback) {
			try {
				if(APIProxyHelper.existsResource(`node://${args.resourceName}`)) {
					Command.openFile(this, `./${global.actualRevision}/apiproxy/resources/node/${args.resourceName}`, callback)
				} else {
					global.output.error(`Resource ${args.resourceName} doesn't exists!!`);
					callback();
				}
			} catch(e) {
				global.output.error();
				callback();
			}
		});

		vorpal
		.command('resource jsc <resourceName>', 'Open resource in jsc')
		.autocomplete(Autocomplete.getResources('jsc'))
		.action(function(args, callback) {
			try {
				if(APIProxyHelper.existsResource(`jsc://${args.resourceName}`)) {
					Command.openFile(this, `./${global.actualRevision}/apiproxy/resources/jsc/${args.resourceName}`, callback)
				} else {
					global.output.error(`Resource ${args.resourceName} doesn't exists!!`);
					callback();
				}
			} catch(e) {
				global.output.error();
				callback();
			}
		});
	}
}

module.exports = Resource;