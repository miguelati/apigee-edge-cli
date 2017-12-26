class Output {
	inProcess(text) {
		console.log(global.chalk.blue(text));
	}

	success(text) {
		console.log(global.chalk.green(text));
	}

	error(text) {
		console.log(global.chalk.red(text));
	}

	updated(text) {
		console.log(global.chalk.magenta(text));
	}

	created(text) {
		console.log(global.chalk.yellow(text));	
	}

	title(text) {
		console.log(global.chalk.cyan(text));
	}

	titleRandom(text) {
		let colors = ['red', 'magenta', 'green', 'cyan', 'blue'];
		let index = Math.floor((Math.random() * colors.length) + 1);
		console.log(global.chalk[colors[index]](text));
	}
}

module.exports = Output;