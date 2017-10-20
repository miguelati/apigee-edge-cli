
var XmlLive = require("./XmlLive");
var _ = require("lodash");

class TargetEndpoint extends XmlLive {
	constructor(opts = {}) {
		super();
		_.defaults(opts, {
			name: "", 
			description: "",
			faultRules: [],
			defaultFaultRule: [], 
			preFlowRequest: [],
			preFlowResponse: [],
			postFlowRequest: [],
			postFlowResponse: [],
			flows: [],
			httpTargetConnection: {},
			routeRule: [],
			fileXml: ""
		});
		
    	this._name = opts.name;
    	this._description = opts.description;
    	this._faultRules = {FaultRule: super.prepareJsonInline(opts.faultRules)};
    	this._defaultFaultRule = {Step: super.prepareJsonInline(opts.defaultFaultRule)};
    	this._preFlowRequest = {Step: super.prepareJsonInline(opts.preFlowRequest)};
    	this._preFlowResponse = {Step: super.prepareJsonInline(opts.preFlowResponse)};
    	this._postFlowRequest = {Step: super.prepareJsonInline(opts.postFlowRequest)};
    	this._postFlowResponse = {Step: super.prepareJsonInline(opts.postFlowResponse)};
    	this._flows = {Flow: super.prepareJsonInline(opts.flows)};
    	this._httpTargetConnection = opts.httpTargetConnection;
    	this._templateName = "target-endpoint";
		this._loadFileXml = opts.fileXml;
		this._baseTag = "TargetEndpoint";
    	
    	super.mapFields({
			"@name":"_name",
			"Description": "_description",
			"FaultRules": "_faultRules",
			"DefaultFaultRule": "_defaultFaultRule",
			"PreFlow.Request" : "_preFlowRequest",
			"PreFlow.Response" : "_preFlowResponse",
			"PostFlow.Request" : "_postFlowRequest",
			"PostFlow.Response" : "_postFlowResponse",
			"Flows" : "_flows",
			"HTTPTargetConnection" : "_httpTargetConnection"
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

	addStepToDefaultFaultRule(step) {
		this._defaultFaultRule.Step.push(step.getJsonInline());
	}

	addFaultRule(faultRule) {
		this._faultRules.FaultRule.push(faultRule.getJsonInline());
	}

	addStepToPreFlowRequest(step) {
		this._preFlowRequest.Step.push(step.getJsonInline());	
	}

	addStepToPreFlowResponse(step) {
		this._preFlowResponse.Step.push(step.getJsonInline());	
	}

	addStepToPostFlowRequest(step) {
		this._postFlowRequest.Step.push(step.getJsonInline());	
	}

	addStepToPostFlowResponse(step) {
		this._postFlowResponse.Step.push(step.getJsonInline());	
	}

	addFlow(flow) {
		this._flows.Flow.push(flow.getJsonInline());
	}

	addHttpTargetConnection(httpTargetConnection) {
		this._httpTargetConnection = httpTargetConnection.getJsonInline();
	}
}

module.exports = TargetEndpoint;