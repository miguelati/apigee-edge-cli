
var XmlLive = require("./XmlLive");
var _ = require("lodash");

class Step extends XmlLive {
	constructor(opts) {
		super();
		_.defaults(opts, {name: "", condition: "", fileXml: ""});
		this._name = opts.name;
		this._condition = opts.condition;
		this._loadFileXml = opts.fileXml;
		this._templateName = "step";
		this._baseTag = "Step";
		super.mapFields({
			"Name":"_name",
			"Condition": "_condition"
		});
	}

	get name() {
		return this._name;
	}

	set name(content) {
		this._name = content;
	}

	get condition() {
		return this._condition;
	}

	set condition(content) {
		this._condition = "("+ content +")";
	}
}

module.exports = Step;