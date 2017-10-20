var XmlLive = require("./XmlLive");
var _ = require("lodash");

class FaultRule extends XmlLive {
	constructor(opts) {
		super();
		_.defaults(opts, {name: "", condition: "", step: [], fileXml: ""});
    	this._name = opts.name;
    	this._condition = opts.condition;
    	this._step = super.prepareJsonInline(opts.step);
    	this._templateName = "fault-rule";
		this._loadFileXml = opts.fileXml;
		this._baseTag = "FaultRule";
    	super.mapFields({
			"@name":"_name",
			"Condition": "_condition",
			"Step" : "_step"
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
		this._condition = content;
	}

	addStep(step) {
		this._step.push(step.getJsonInline());
	}

}
module.exports = FaultRule;