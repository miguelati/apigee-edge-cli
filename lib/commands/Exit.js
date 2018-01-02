class Exit {
	static injectCommand(vorpal) {
		const exit = vorpal.find('exit')
		if (exit) {
		  exit.remove()
		}

		vorpal
		  .command('exit')
		  .alias('quit')
		  .option('-f, --force', 'Forces process kill without confirmation.')
		  .description('Exits this instance of edge-client')
		  .action(function (args) {
		    global.watcher.stop();
		    args.options = args.options || {}
		    args.options.sessionId = this.session.id
		    this.parent.exit(args.options)
		  })
	}
}

module.exports = Exit;