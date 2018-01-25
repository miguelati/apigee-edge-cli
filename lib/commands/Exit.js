class Exit {
	static injectCommand(vorpal) {
		const exit = vorpal.find('exit')
		if (exit) exit.remove();

		vorpal
		.command('exit')
		.alias('quit')
		.option('-f, --force', 'Forces process kill without confirmation.')
		.description('Exits this instance of edge-client')
		.action((args) => {
			global.watcher.stop();
			args.options = args.options || {};
			args.options.sessionId = vorpal.activeCommand.session.id;
			vorpal.activeCommand.parent.exit(args.options);
		});
	}
}

module.exports = Exit;