
var XmlLive = require("./XmlLive");
var _ = require("lodash");

class RouteRule extends XmlLive {
	constructor(opts) {
		super();
		_.defaults(opts, {name: "", condition: "", targetEndpoint: "", fileXml: ""});
		this._name = opts.name;
		this._condition = opts.condition;
		this._targetEndpoint = opts.targetEndpoint;
		this._loadFileXml = opts.fileXml;
		this._templateName = "route-rule";
		this._baseTag = "HTTPProxyConnection";
		super.mapFields({
			"@name":"_name",
			"TargetEndpoint": "_targetEndpoint",
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

	get targetEndpoint() {
		return this._targetEndpoint;
	}

	set targetEndpoint(content) {
		this._targetEndpoint = content;
	}
}

module.exports = RouteRule;