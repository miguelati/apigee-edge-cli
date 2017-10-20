
var XmlLive = require("../XmlLive");
var _ = require("lodash");

class AccessControl extends XmlLive {
	constructor(opts) {
		super();
		_.defaults(opts, {name: "", displayName: "", async: "false", continueOnError: "false", properties: [], enabled: "true", fileXml: ""});
		this._name = opts.name;
		this._displayName = opts.displayName;
		this._async = opts.async;
		this._continueOnError =  opts.continueOnError;
		this._enabled = opts.enabled;
		this._properties = {Property: super.prepareJsonInline(opts.properties)},
		this._ipRules = {MatchRule: []};
		this._loadFileXml = opts.fileXml;
		this._templateName = "policies/access-control";
		this._baseTag = "AccessControl";
		super.mapFields({
			"@name":"_name",
			"@async": "_async",
			"@continueOnError": "_continueOnError",
			"@enabled":"_enabled",
			"DisplayName" : "_displayName",
			"Property": "_properties",
			"IPRules" : "_ipRules"
		});
	}

	get name() {
		return this._name;
	}

	set name(content) {
		this._name = content;
	}

	get displayName() {
		return this._displayName
	}

	set displayName(content) {
		this._displayName = content;
	}

	get async() {
		return this._async;
	}

	set async(content) {
		this._async = content;
	}

	get continueOnError() {
		return this._continueOnError;
	}

	set continueOnError(content) {
		this._continueOnError = content;
	}

	get enabled() {
		return this._enabled;
	}

	set enabled(content) {
		this._enabled = content;
	}

	addIpRule(ipRule) { // {name: "test", mask: 32, ip: "10.0.10.0"}
		this._ipRules.MatchRule.push({"@name": ipRule.name, SourceAddress: {"@mask": ipRule.mask, "#": ipRule.ip}});
	}

	addProperty(property) { // {name: "TestName", value: "TestValue"}
		this._properties.Property.push({"@name": property.name, "#": property.value});
	}
}

module.exports = AccessControl;