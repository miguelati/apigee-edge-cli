var XmlLive = require("./XmlLive");
var _ = require("lodash");

class HTTPTargetConnection extends XmlLive {
	constructor(opts) {
		super();
		_.defaults(opts, {url: "", properties: [], fileXml: ""});
		this._url = opts.url;
		this._properties = {Property: super.prepareJsonInline(opts.properties)};		
		this._loadFileXml = opts.fileXml;
		this._templateName = "http-target-connection";
		this._baseTag = "HTTPTargetConnection";
		super.mapFields({
			"URL":"_url",
			"Properties": "_properties"
		});
	}

	get url() {
		return this._url;
	}

	set url(content) {
		this._url = content;
	}

	addProperty(property) {
		this._properties.Property.push({"@name": property.name, "#": property.value});
	}
}

module.exports = HTTPTargetConnection;