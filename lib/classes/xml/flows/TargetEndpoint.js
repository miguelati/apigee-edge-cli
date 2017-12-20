
const XmlLive = require("../XmlLive");
const TagFactory = require("../TagFactory");
const path = require('path');

class TargetEndpoint extends XmlLive {

	createBaseEmpty() {
		this.addDescription(null);
		this.addFaultRules(null);

		let requestPreFlow = new TagFactory("Request");
		requestPreFlow.content = null;

		let responsePreFlow = new TagFactory("Response");
		responsePreFlow.content = null;

		this.addPreFlow({attr: {"name": "PreFlow"}, content: [requestPreFlow, responsePreFlow]});
		
		let requestPostFlow = new TagFactory("Request");
		requestPostFlow.content = null;

		let responsePostFlow = new TagFactory("Response");
		responsePostFlow.content = null;
		
		this.addPostFlow({attr: {"name": "PostFlow"}, content: [requestPostFlow, responsePostFlow]});

		this.addFlow(null);
	}

	createEmptyWithHTTPTargetConnection(url) {
		this.createBaseEmpty();

		let httpTargetConnection = new TagFactory("HTTPTargetConnection");
		httpTargetConnection.createEmpty(url);

		this.addTag(httpTargetConnection);
	}

	createEmptyWithScriptTarget(script) {
		this.createBaseEmpty();

		let scriptTarget = new TagFactory("ScriptTarget");
		scriptTarget.addResourceURL(`node://${path.basename(script)}`);

		this.addTag(scriptTarget);
	}

	createEmptyLocalTargetConnection(options = {}) {
		this.createBaseEmpty();
		let localTargetConnection = new TagFactory("LocalTargetConnection");

		if(options.path !== undefined) {
			localTargetConnection.addPath(options.path);
		} else if(options.apiproxy !== undefined) {
			localTargetConnection.addAPIProxy(options.apiproxy);
			localTargetConnection.addProxyEndpoint(options.proxyEndpoint);
		}

		this.addTag(localTargetConnection);
	}
}

module.exports = TargetEndpoint;