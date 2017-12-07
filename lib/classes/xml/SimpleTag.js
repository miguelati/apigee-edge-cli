const XmlLive = require("./XmlLive");

class SimpleTag extends XmlLive {
	constructor(name) {
		super();
		this._baseTag = name;
	}
}

module.exports = SimpleTag;