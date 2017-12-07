const fs = require("fs-plus");
const _ = require("lodash");
const dotty = require("dotty");
const TagFactory = require("../xml/TagFactory");

class ApiProxy {
	static create(swagger) {
		let proxy = new ApiProxy(swagger);
	}

	constructor(swagger) {
		this._swagger = swagger;
		this._policies = [];
		this.createProxyEndpoint(swagger);
		this.createTargetEndpoint();
		this.createApiProxyFile(swagger);
	}

	createTargetEndpoint(name = "default") {
		let targetEndpoint = new TagFactory("TargetEndpoint");
		targetEndpoint.name = name;
		targetEndpoint.addDescription();
		targetEndpoint.addFaultRules();

		let requestPreFlow = new TagFactory("Request");
		requestPreFlow.content = null;

		let responsePreFlow = new TagFactory("Response");
		responsePreFlow.content = null;
		
		targetEndpoint.addPreFlow({attr: {"name": "PreFlow"}, content: [requestPreFlow, responsePreFlow]});

		let requestPostFlow = new TagFactory("Request");
		requestPostFlow.content = null;

		let responsePostFlow = new TagFactory("Response");
		responsePostFlow.content = null;
		
		targetEndpoint.addPostFlow({attr: {"name": "PostFlow"}, content: [requestPostFlow, responsePostFlow]});

		let properties = new TagFactory("Properties");
		properties.content = null;

		let url = new TagFactory("URL");
		url.content = null;//"https://devapi.tigo.com.sv/TigoAPIMFS/GetUserDetails/V3";

		targetEndpoint.addHTTPTargetConnection(properties, url);

		//console.log(targetEndpoint.toXml());
	}

	createApiProxyFile(swagger) {
		let apiProxy = new TagFactory("APIProxy");
		apiProxy.revision = "1";
		apiProxy.name = swagger.info.title;//"TigoMoneyAccountStatusService";

		apiProxy.addBasepaths(swagger.basePath);
		apiProxy.addConfigurationVersions({attr: {majorVersion: 1, minorVersion: 0}, content: ""});
		apiProxy.addCreatedAt(new Date().getTime().toString());
		apiProxy.addCreatedBy(swagger.info.contact.email);
		apiProxy.addDescription();
		apiProxy.addDisplayName(swagger.info.title);
		apiProxy.addLastModifiedAt(new Date().getTime().toString());
		apiProxy.addLastModifiedBy(swagger.info.contact.email);

		apiProxy.addPolicyInPolicies.apply(this, this._policies);

		apiProxy.addProxyEndpointInProxyEndpoints("default");
		//apiProxy.addResourceInResources("jsc://setTargetUrl.js");
		apiProxy.addSpec();
		apiProxy.addTargetServers();
		apiProxy.addTargetEndpointInTargetEndpoints("default");
		apiProxy.addvalidate("false");

		//console.log(apiProxy.toXml());
	}

	createProxyEndpoint(swagger) {
		let proxyEndpoint = new TagFactory("ProxyEndpoint");
		proxyEndpoint.addDescription();
		proxyEndpoint.addFaultRules();
		if(dotty.exists(swagger, "securityDefinitions.application.type")) {
			if(dotty.get(swagger, "securityDefinitions.application.type") == "oauth2") {
				let nameOAuthPolicy = "VerifyAccessTokenPolicy";
				this.createOAuth2Policy(nameOAuthPolicy);
				
				let preFlow = new TagFactory("PreFlow");
				preFlow.name = "PreFlow";

				let step = new TagFactory("Step");
				step.addName(nameOAuthPolicy);

				preFlow.addRequest(step);
				proxyEndpoint.addTag(preFlow);
			}
		} else {
			let preFlow = new TagFactory("PreFlow");
			preFlow.name = "PreFlow";
			preFlow.addRequest(null);
			proxyEndpoint.addTag(preFlow);
		}

		let flows = [];
		for(let path in swagger.paths) {
			for(let verb in swagger.paths[path]) {
				let flow = this.createFlow(path, verb, swagger.paths[path][verb]);
				flows.push(flow);
			}
		}

		proxyEndpoint.addFlows.apply(this, flows);



		//console.log(proxyEndpoint.toXml());
	}

	createOAuth2Policy(name="VerifyAccessTokenPolicy") {
		this._policies.push(_.kebabCase(name));
		let oAuthV2 = new TagFactory("OAuthV2");
		oAuthV2.async = "false";
		oAuthV2.continueOnError = "false";
		oAuthV2.enabled = "true";
		oAuthV2.name = _.kebabCase(name);
		oAuthV2.addDisplayName(name);
		oAuthV2.addOperation("VerifyAccessToken");
		oAuthV2.addAccessTokenPrefix("Bearer");
		//console.log(oAuthV2.toXml());
	}

	createFlow(path, verb, content) {
		let flow = new TagFactory("Flow");
		flow.name = content.operationId;
		flow.addDescription(content.summary);



		console.log(path);
		console.log(content.parameters);
		console.log("----->")

		return flow;
	}

	createExtractVariable(name, parameters) {
		this._policies.push(_.kebabCase(name));
	}
}

module.exports = ApiProxy;