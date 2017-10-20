var XmlLive = require("./XmlLive");
var _ = require("lodash");

class Flow extends XmlLive {
	constructor(opts) {
		super();
		_.defaults(opts, {name: "", description: "", condition: "", request: [], response: [], fileXml: ""});
    	this._name = opts.name;
    	this._description = opts.description;
    	this._condition = opts.condition;
    	this._request = {Step: super.prepareJsonInline(opts.request)};
    	this._response = {Step: super.prepareJsonInline(opts.response)};
    	this._templateName = "flow";
		this._loadFileXml = opts.fileXml;
		this._baseTag = "Flow";
    	super.mapFields({
			"@name":"_name",
			"Description": "_description",
			"Condition": "_condition",
			"Request" : "_request",
			"Response" : "_response"
		});
	}

	get name() {
		return this._name;
	}

	set name(content) {
		this._name = content;
	}

	get description() {
		return this._description;
	}

	set description(content) {
		this._description = content;
	}

	get condition() {
		return this._condition;
	}

	set condition(content) {
		this._condition = content;
	}

	addStepToResponse(step) {
		this._response.Step.push(step.getJsonInline());
	}

	addStepToRequest(step) {
		this._request.Step.push(step.getJsonInline());
	}

	pathCondition(path, method) {
		this._condition = "(proxy.pathsuffix MatchesPath \"" + path + "\") and (request.verb = \"" + method.toUpperCase() + "\")";
	}
}

module.exports = Flow;
/*
var flow = new Flow('GetAlgo');
flow.description = "Para hacer algo";
flow.pathCondition("/algo/", "get");
flow.save("proxy");
*/