const _ = require('lodash');
const CLI = require("clui");
const cliSpinner = CLI.Spinner;

class Spinner {

	constructor(message, type = "dots") {
		this._message = message;
		this._graph = {"dots": ['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷']};
		this._spinner = new cliSpinner(global.chalk.blue(this._message), this._graph.dots);
	}

	start() {
		this._spinner.start();
	}

	stop() {
		this._spinner.stop();	
	}

	message(message) {
		this.spinner.message(global.chalk.blue(message));
	}
}

module.exports = Spinner;