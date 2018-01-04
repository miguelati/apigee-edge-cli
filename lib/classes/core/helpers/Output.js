const _ = require("lodash");

class Output {
	constructor(vorpal) {
		this._vorpal = vorpal;
	}

	activeVorpalLog(text) {
		if(this._vorpal.activeCommand === undefined) {
			this._vorpal.log(text);
		} else {
			this._vorpal.activeCommand.log(text);
		}
	}

	inProcess(text) {
		this.activeVorpalLog(global.chalk.blue(text));
	}

	success(text) {
		this.activeVorpalLog(global.chalk.green(text));
	}

	error(error) {
		if(_.isString(error)) 
			this.activeVorpalLog(global.chalk.red(error));
		else if(_.isObject(error)) {
			if(_.has(error, 'response.message')) { // request error
				this.activeVorpalLog(global.chalk.red(error.response.message));
			} else {
				this.activeVorpalLog(global.chalk.red(JSON.stringify(error)));		
			}
		}
	}

	updated(text) {
		this.activeVorpalLog(global.chalk.magenta(text));
	}

	created(text) {
		this.activeVorpalLog(global.chalk.yellow(text));	
	}

	title(text) {
		this.activeVorpalLog(global.chalk.cyan(text));
	}

	titleRandom(text) {
		let colors = ['red', 'magenta', 'green', 'cyan', 'blue'];
		let index = Math.floor((Math.random() * colors.length));
		this.activeVorpalLog(global.chalk[colors[index]](text));
	}

	log(text) {
		this.activeVorpalLog(text);
	}
}

module.exports = Output;