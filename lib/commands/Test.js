const ApiProxyHelper = require('../classes/core/helpers/APIProxy');

class Test {
	static injectCommand(vorpal) {
		vorpal
		.command('test', 'My Test')
		.action((args, callback) => {
			ApiProxyHelper.changeRevision("63");
			callback();
		});
	}
}

module.exports = Test;