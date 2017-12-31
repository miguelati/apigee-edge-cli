
const XmlLive = require("../XmlLive");

class AssingMessage extends XmlLive {
	constructor() {
		this._name = null;
		this._callback = null;
	}

	initQuestion(vorpal, name = "", callback) {
		this._name = name;
		this._callback = callback;
		this.content = {add: [], remove: [], }
	}
}

module.exports = AssingMessage;
