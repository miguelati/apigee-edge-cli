const Overlap = require("overlap");
const Couleurs = require("couleurs");
const Box = require("cli-box");
const cliSize = require("cli-size");

class NewUpdate {
	static draw(actualVersion, installedVersion, type, name) {
		let newUpdate = new NewUpdate(actualVersion, installedVersion, type, name);
		return newUpdate.draw();	
	}

	constructor(actualVersion, installedVersion, type, name) {
		// Received
		this._actualVersion = actualVersion;
		this._installedVersion = installedVersion;
		this._type = type;
		this._name = name;
		this._buffer = "";
		// Calculated
		this._screen = cliSize();
		this._canvasSize = this._screen.columns;
		this._canvasPadding = 2;
		this._boxPadding = 2;
		this._boxSpacing = 2;

		this.drawBox();
	}

	drawBox() {
		let text = `Update available ${global.chalk.gray(this._installedVersion)} -> ${global.chalk.green(this._actualVersion)}\nRun ${global.chalk.cyan(`npm i -g ${this._name}`)} to update`
		this._buffer = Box(Math.ceil(this._canvasSize / 3) + "x4", {text:  text, vAlign: "center", hAlign: "center"});
	}

	draw() {
		return this._buffer;
	}
}

module.exports = NewUpdate;