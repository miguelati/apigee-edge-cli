const XmlLive = require("../XmlLive");
const TagFactory = require("../TagFactory");

class ProxyEndpoint extends XmlLive {
	createEmpty(name, basePath, virtualHosts) {

		this.name = name;
		this.addDescription(null);
		this.addFaultRules(null);
		
		let preFlow = new TagFactory("PreFlow");
		preFlow.name = "PreFlow";
		preFlow.addRequest(null);
		preFlow.addResponse(null);
		this.addTag(preFlow);
		
		this.addFlows(null);

		let postFlow = new TagFactory("PostFlow");
		postFlow.name = "PostFlow";
		postFlow.addRequest(null);
		postFlow.addResponse(null);
		this.addTag(postFlow);

		let httpProxyConnection = new TagFactory("HTTPProxyConnection");
		httpProxyConnection.addBasepaths(basePath);
		httpProxyConnection.addProperties(null);
		for(let index in virtualHosts) {
			httpProxyConnection.addVirtualHost(virtualHosts[index]);	
		}

		this.addTag(httpProxyConnection);

	}
}

module.exports = ProxyEndpoint;