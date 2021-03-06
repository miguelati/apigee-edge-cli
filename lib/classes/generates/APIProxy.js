const fs = require("fs-plus");
const _ = require("lodash");
const TagFactory = require("../xml/TagFactory");
const moment = require("moment");
const SwaggerToPostman = require("swagger2-to-postman");

class ApiProxy {
	static create(swagger) {
		let proxy = new ApiProxy(swagger);
	}

	constructor(swagger) {
		this._swagger = swagger;
		this._policies = [];
		this._flowParams = {};
		global.actualRevision = "1";
		this.createFoldersStructure();
		this.createProxyEndpoint(swagger);
		this.createTargetEndpoint();
		this.createApiProxyFile(swagger);
	}

	createFoldersStructure() {
		var dirs = [`./${global.actualRevision}/apiproxy/policies/`, `./${global.actualRevision}/apiproxy/proxies/`, `./${global.actualRevision}/apiproxy/resources/jsc`, `./${global.actualRevision}/apiproxy/targets`];

		for (var i = 0; i < dirs.length; i++) {
			if(!fs.existsSync(dirs[i])) {
				fs.makeTreeSync(dirs[i]);
				global.output.created(`Create ${dirs[i]}`);
			}
		}
	}

	createTargetEndpoint(name = "default") {
		let targetEndpoint = new TagFactory("TargetEndpoint");
		
		targetEndpoint.createEmptyWithHTTPTargetConnection(name, "http://example.com");
		
		ApiProxy.writeFile(`./${global.actualRevision}/apiproxy/targets/${targetEndpoint.name}.xml`, targetEndpoint.toXml());
	}

	createApiProxyFile(swagger) {

		let apiProxy = new TagFactory("APIProxy");
		
		apiProxy.revision = "1";
		apiProxy.name = swagger.info.title;//"TigoMoneyAccountStatusService";
		apiProxy.addBasepaths(swagger.basePath);
		apiProxy.addConfigurationVersion({attr: {majorVersion: 1, minorVersion: 0}, content: ""});
		apiProxy.addCreatedAt(`${moment().valueOf()}`);
		apiProxy.addCreatedBy(swagger.info.contact.email);
		apiProxy.addDescription(null);
		apiProxy.addDisplayName(swagger.info.title);
		apiProxy.addLastModifiedAt(`${moment().valueOf()}`);
		apiProxy.addLastModifiedBy(swagger.info.contact.email);

		apiProxy.addPolicyInPolicies.apply(this, this._policies);

		apiProxy.addProxyEndpointInProxyEndpoints("default");
		//apiProxy.addResourceInResources("jsc://setTargetUrl.js");
		apiProxy.addSpec(null);
		apiProxy.addTargetServers(null);
		apiProxy.addTargetEndpointInTargetEndpoints("default");
		apiProxy.addvalidate("false");

		ApiProxy.writeFile(`./${global.actualRevision}/apiproxy/${apiProxy.name}.xml`, apiProxy.toXml());
	}

	createProxyEndpoint(swagger) {
		let proxyEndpoint = new TagFactory("ProxyEndpoint");
		proxyEndpoint.name = "default";
		proxyEndpoint.addDescription(null);
		proxyEndpoint.addFaultRules(null);
		if(_.has(swagger, "securityDefinitions.application.type")) {
			if(_.get(swagger, "securityDefinitions.application.type") == "oauth2") {
				let nameOAuthPolicy = "VerifyAccessTokenPolicy";
				this.createOAuth2Policy(nameOAuthPolicy);
				
				let preFlow = new TagFactory("PreFlow");
				preFlow.name = "PreFlow";

				let step = new TagFactory("Step");
				step.addName(nameOAuthPolicy);

				preFlow.addRequest(step);
				preFlow.addResponse(null);
				proxyEndpoint.addTag(preFlow);
			}
		} else {
			let preFlow = new TagFactory("PreFlow");
			preFlow.name = "PreFlow";
			preFlow.addRequest(null);
			preFlow.addResponse(null);
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

		let postFlow = new TagFactory("PostFlow");
		postFlow.name = "PostFlow";
		postFlow.addRequest(null);
		postFlow.addResponse(null);
		proxyEndpoint.addTag(postFlow);

		let httpProxyConnection = new TagFactory("HTTPProxyConnection");
		httpProxyConnection.addBasepaths(swagger.basePath);
		httpProxyConnection.addProperties(null);
		httpProxyConnection.addVirtualHost(null);

		proxyEndpoint.addTag(httpProxyConnection);

		ApiProxy.writeFile(`./${global.actualRevision}/apiproxy/proxies/{proxyEndpoint.name}.xml`, proxyEndpoint.toXml());
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

		ApiProxy.writeFile(`./${global.actualRevision}/apiproxy/policies/${_.kebabCase(name)}.xml`, oAuthV2.toXml());
	}

	createFlow(path, verb, content) {
		let flow = new TagFactory("Flow");
		flow.name = content.operationId;
		flow.addDescription(content.summary);

		let extract = this.createExtractVariable(content.operationId + ": Extract", path, verb, content.parameters);

		let step = new TagFactory("Step");
		step.addName(extract.name);
		flow.addRequest(step);
		flow.addResponse(null);

		return flow;
	}

	createExtractVariable(name, path, verb, parameters) {
		this._policies.push(_.kebabCase(name));
		let extractVariable = new TagFactory("ExtractVariables");
		extractVariable.async = "true";
		extractVariable.continueOnError = "false";
		extractVariable.enabled = "true";
		extractVariable.name = _.kebabCase(name);
		extractVariable.addDisplayName(name);
		extractVariable.addProperties(null);
		extractVariable.addIgnoreUnresolvedVariables("true");

		let urlMatches = path.match(/(\{\w+\})+/g);
		if(urlMatches != null) {
			let uriPath = new TagFactory("URIPath");
			uriPath.addPattern({attr: {ignoreCase:"true"}, content: path});
			extractVariable.addTag(uriPath);
		}

		if(verb == "get") {
			let queryParams = [];
			for(let index in parameters) {
				if(parameters[index].in == "query") {
					let queryParam = new TagFactory("QueryParam");
					queryParam.name = parameters[index].name;
					queryParam.addPattern({attr: {ignoreCase: "true"}, content: "{"+ parameters[index].name +"}"});		
					queryParams.push(queryParam);
					extractVariable.addTag(queryParam);
				}
			}
		} else if (verb == "post") {
			for(let index in parameters) {
				if(parameters[index].in == "body" && _.has(parameters[index], 'schema')) {
					
					let paths = _.flattenDeep(this.getJsonParameter("$", parameters[index].schema));

					let variables = [];

					for(let index in paths) {
						let variable = new TagFactory("Variable");
						variable.name = paths[index].path.replace("$.", "");
						variable.addJSONPath(paths[index].path);
						variables.push(variable);
					}

					extractVariable.addJSONPayload.apply(this, variables);
				}
			}
		}

		ApiProxy.writeFile(`./${global.actualRevision}/apiproxy/policies/${_.kebabCase(name)}.xml`, extractVariable.toXml());
		
		return extractVariable;
	}

	getJsonParameter(path, node) {
		if(node.type == "object") {
			let ret = [];
			for(let key in node.properties) {
				ret.push(this.getJsonParameter(path + "." + key, node.properties[key]));	
			}
			return ret;
		} else if (node.type != "object") {
			return {path: path, node: node};
		}
	}

	static generatePostman(name, swagger) {
		let swaggerConverter = new SwaggerToPostman();
		let convertResult = swaggerConverter.convert(swagger);
		ApiProxy.writeFile("./" + name + "_postman.json", JSON.stringify(convertResult.collection));
	}

	static writeFile(path, content) {
		if(fs.existsSync(path)) {
			fs.writeFileSync(path, content, { encoding: 'utf8'});
			global.output.updated("Updated " + path);
		} else {
			fs.writeFileSync(path, content, { encoding: 'utf8'});
			global.output.created("Created " + path);
		}
	}
}

module.exports = ApiProxy;