class Test {
	static injectCommand(vorpal) {
		vorpal
		.command('Test', 'My Test')
		.action((args, callback) => {
			callback();
		});
	}
}

module.exports = Test;