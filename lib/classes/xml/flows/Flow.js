const XmlLive = require("../XmlLive");

class Flow extends XmlLive {
	pathCondition(path, method) {
		this.attributes["condition"] = "(proxy.pathsuffix MatchesPath \"" + path + "\") and (request.verb = \"" + method.toUpperCase() + "\")";
	}
}

module.exports = Flow;