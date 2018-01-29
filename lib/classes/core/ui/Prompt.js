const APIProxy = require("../helpers/APIProxy");
const ProxyEndpointHelper = require('../helpers/ProxyEndpoint');
const _ = require('lodash');
const inquirer = require('inquirer');

class Prompt {
	constructor() {
		inquirer.registerPrompt('selectLine', require('inquirer-select-line'));
		this._asks = [];
		this._listEditors = {
			'Sublime Text': 'sublime',
			'Atom Editor': 'atom',
			'Visual Studio Code': 'code',
			'WebStorm' : 'webstorm',
			'PhpStorm' : 'phpstorm',
			'IDEA 14 CE': 'idea14ce',
			'Vim (via Terminal, Mac OS only)': 'vim',
			'Emacs (via Terminal, Mac OS only)': 'emacs',
			'Visual Studio': 'visualstudio'
		};
	}

	clean() {
		this._asks = [];	
	}

	preparePromptObj(name, type, message, choices = [], options = {}) {
		let ask = {};
		ask.type = type;
		ask.name = name;
		ask.message = message;
		if(!_.isEmpty(choices) || _.isFunction(choices)) ask.choices = choices;
		return _.merge(ask, options);
	}

	selectEditor(options = {}) {
		this.list('editor', 'Select your editor:', this._listEditors, options);
	}

	selectProxyEndpoint(name = "proxyEndpoint", options = {}) {
		this._asks.push(this.preparePromptObj(name, 'list', 'Select a Proxy Endpoint:', APIProxy.getProxyEndpoints()));
	}

	selectTargetEndpoint(name = "targetEndpoint", type = "list") {
		this._asks.push(this.preparePromptObj(name, type, 'Select a Target Endpoint:', APIProxy.getTargetEndpoints()));
	}

	selectPolicyOfAll(name = "policy", type = "list") {
		this._asks.push(this.preparePromptObj(name, type, 'Select a Policy:', APIProxy.getPolicies()));
	}

	list(name, message, choices, options = {}) {
		this._asks.push(this.preparePromptObj(name, 'list', message, choices, options));
	}

	check(name, message, choices, options = {}) {
		this._asks.push(this.preparePromptObj(name, 'checkbox', message, choices, options));
	}

	confirm(name, message, options = {}) {
		this._asks.push(this.preparePromptObj(name, 'confirm', message, null, options));
	}

	input(name, message, options = {}) {
		this._asks.push(this.preparePromptObj(name, 'input', message, null, options));
	}

	password(name, message, options = {}) {
		this._asks.push(this.preparePromptObj(name, 'password', message, null, options));
	}

	selectLine(name, message, choices, options = {}) {
		let newOptions = _.defaults(options, {prefix: global.chalk.green("?"), suffix: ""});
		this._asks.push(this.preparePromptObj(name, 'selectLine', message, choices, newOptions));
	}

	selectFlow(proxyEndpointName = "proxyEndpointName", flowName = "flowName", options = {}) {
		this.selectProxyEndpoint(proxyEndpointName, options);
		let flowChoices = (result) => {
			let proxyEndpoint = new ProxyEndpointHelper(result[proxyEndpointName]);
			return proxyEndpoint.getFlowsNames();
		}
		this.list(flowName, 'Select a Flow:', flowChoices, options);
	}

	insertPolicy(params = {}) {
		_.defaults(params, {
			proxyEndpointName: "proxyEndpointName",
			flowName: "flowName", 
			type: "type", 
			index: "index", 
			condition: "condition",
			options: {}
		});
		
		let policyChoices = (result) => {
			let proxyEndpoint = new ProxyEndpointHelper(result[params.proxyEndpointName]);			
			if(result.type == "Request") return proxyEndpoint.getFlowRequestStepNames(result[params.flowName]);
			else return proxyEndpoint.getFlowResponseStepNames(result[params.flowName]);
		};
		this.selectFlow(params.proxyEndpointName, params.flowName, params.options);
		this.list(params.type, 'Select one:', ['Request', 'Response'], params.options);
		this.selectLine(params.index, 'Select a position:', policyChoices, params.options);
		this.input(params.condition, 'Insert a Condition for step:', params.options);
	}


	addCustom(promptObj) {
		this._asks.push(promptObj);
	}

	show() {
		return inquirer.prompt(this._asks);
	}

}

module.exports = Prompt;