var XmlLive = require("./XmlLive");
var _ = require("lodash");

class HTTPProxyConnection extends XmlLive {
	constructor(opts) {
		super();
		_.defaults(opts, {basepath: "", properties: [], virtualHost: [], fileXml: ""});
		this._basepath = opts.basepath;
		this._properties = {Property: super.prepareJsonInline(opts.properties)};
		this._virtualHost = super.prepareJsonInline(opts.virtualHost);
		this._loadFileXml = opts.fileXml;
		this._templateName = "http-proxy-connection";
		this._baseTag = "HTTPProxyConnection";
		super.mapFields({
			"BasePath":"_basepath",
			"Properties": "_properties",
			"VirtualHost": "_virtualHost"
		});
	}

	get basepath() {
		return this._basepath;
	}

	set basepath(content) {
		this._basepath = content;
	}

	addProperty(property) {
		this._properties.Property.push({"@name": property.name, "#": property.value});
	}

	addVirtualHost(virtualHost) {
		this._virtualHost.push(virtualHost);
	}
}

module.exports = HTTPProxyConnection;