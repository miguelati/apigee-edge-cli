const CLI = require("clui");
const Spinner = CLI.Spinner;

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
			var countdown = new Spinner(global.chalk.blue(`Close all watchers... `), ['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷']);
			countdown.start();
			global.watcher.stop();
			args.options = args.options || {};
			args.options.sessionId = vorpal.activeCommand.session.id;
			vorpal.activeCommand.parent.exit(args.options);
			countdown.stop();
		});
	}
}

module.exports = Exit;