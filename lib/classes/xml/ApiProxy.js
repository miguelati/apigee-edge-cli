var XmlLive = require("./XmlLive");
var _ = require("lodash");
var moment = require('moment');

class ApiProxy extends XmlLive {
	constructor(opts = {}) {
		super();
		_.defaults(opts, {
			name: "", 
			revision: "",
			basepaths: "", 
			configurationVersion: {majorVersion: "1", minorVersion: "1"}, 
			createdAt: "", 
			createdBy: "", 
			description: "", 
			displayName: "", 
			lastModifiedAt: "",
			lastModifiedBy: "",
			policies: [],
			proxyEndpoints: [],
			resources: [],
			targetEndpoints: [],
			validate: "false",
			fileXml: ""
		});
		
    	this._name = opts.name;
    	this._revision = opts.revision;
    	this._basepaths = opts.basepaths;
    	this._configurationVersionMajorVersion = opts.configurationVersion.majorVersion;
    	this._configurationVersionMinorVersion = opts.configurationVersion.minorVersion;
    	this._createdAt = opts.createdAt;
    	this._createdBy = opts.createdBy;
    	this._description = opts.description;
    	this._displayName = opts.displayName;
    	this._lastModifiedAt = opts.lastModifiedAt;
    	this._lastModifiedBy = opts.lastModifiedBy;
    	this._policies = {Policy: super.prepareJsonInline(opts.policies)};
    	this._proxyEndpoints = {ProxyEndpoint: super.prepareJsonInline(opts.proxyEndpoints)};
    	this._resources = {Resource: super.prepareJsonInline(opts.resources)};
    	this._targetEndpoints = {TargetEndpoint: super.prepareJsonInline(opts.targetEndpoints)};
    	this._validate = opts.validate;
    	this._templateName = "api-proxy";
		this._loadFileXml = opts.fileXml;
		this._baseTag = "APIProxy";
    	
    	super.mapFields({
			"@name":"_name",
			"@revision": "_revision",
			"Basepaths" : "_basepaths",
			"ConfigurationVersion.@majorVersion" : "_configurationVersionMajorVersion",
			"ConfigurationVersion.@minorVersion" : "_configurationVersionMinorVersion",
			"CreatedAt" : "_createdAt",
			"CreatedBy" : "_createdBy",
			"Description" : "_description",
			"DisplayName" : "_displayName",
			"LastModifiedAt" : "_lastModifiedAt",
			"LastModifiedBy" : "_lastModifiedBy",
			"Policies" : "_policies",
			"ProxyEndpoints" : "_proxyEndpoints",
			"Resources" : "_resources",
			"TargetEndpoints" : "_targetEndpoints",
			"validate" : "_validate"
		});
	}

	get name() {
		return this._name;
	}

	set name(content) {
		this._name = content;
	}

	get revision() {
		return this._revision;
	}

	set revision(content) {
		this._revision = content;
	}

	get basepaths() {
		return this._basepaths;
	}

	set basepaths(content) {
		this._basepaths = content;
	}

	get configurationVersion() {
		return {majorVersion: this._configurationVersionMajorVersion, minorViersion: this._configurationVersionMinorVersion};
	}

	set configurationVersion(content) {
		this._configurationVersionMajorVersion = content.majorVersion;
    	this._configurationVersionMinorVersion = content.minorVersion;
	}

	get createdAt() {
		return moment(this._createdAt).toDate();
	}

	set createdAt(content) {
		this._createdAt = moment(content * 1000).unix();
	}

	get createdBy() {
		return this._createdBy;
	}

	set createdBy(content) {
		this._createdBy = content;
	}

	get description() {
		return this._description;
	}

	set description(content) {
		this._description = content;
	}

	get displayName() {
		return this._displayName;
	}

	set displayName(content) {
		this._displayName = content;
	}

	get lastModifiedAt() {
		return moment(this._lastModifiedAt).toDate();
	}

	set lastModifiedAt(content) {
		this._lastModifiedAt = moment(content * 1000).unix();
	}

	get lastModifiedBy() {
		return this._lastModifiedBy;
	}

	set lastModifiedBy(content) {
		this._lastModifiedBy = content;
	}

	addPolicy(policy) {
		this._policies.Policy.push(policy);
	}

	addProxyEndpoint(proxyEndpoint) {
		this._proxyEndpoints.ProxyEndpoint.push(proxyEndpoint);
	}

	addResource(resource) {
		this._resources.Resource.push(resource);
	}

	addTargetEndpoint(targetEndpoint) {
		this._targetEndpoints.TargetEndpoint.push(targetEndpoint);
	}

	get validate() {
		return this._validate;
	}

	set validate(content) {
		this._validate = content;
	}

}

module.exports = ApiProxy;