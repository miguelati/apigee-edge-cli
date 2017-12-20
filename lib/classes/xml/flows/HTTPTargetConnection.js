const XmlLive = require("../XmlLive");
const TagFactory = require("../TagFactory");

class HTTPTargetConnection extends XmlLive {
	createEmpty(targetUrl) {
		let properties = new TagFactory("Properties");
		properties.content = null;

		let url = new TagFactory("URL");
		url.content = targetUrl;

		this.addTag(properties);
		this.addTag(url);
	}
}

module.exports = HTTPTargetConnection;