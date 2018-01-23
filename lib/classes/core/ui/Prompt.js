const APIProxy = require("../helpers/APIProxy");
const _ = require('lodash');

class Prompt {
	constructor(vorpal) {
		this._vorpal = vorpal;
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
		options.type = type;
		options.name = name;
		options.message = message;
		if(!_.isEmpty(choices)) options.choices = choices;
		return options;
	}

	selectEditor(options = {}) {
		this.list('editor', 'Select your editor:', this._listEditors, options);
	}

	selectProxyEndpoint(name = "proxyEndpoint", type = "list", options = {}) {
		this._asks.push(this.preparePromptObj(name, type, 'Select a Proxy Endpoint:', APIProxy.getProxyEndpoints()));
	}

	selectTargetEndpoint(name = "targetEndpoint", type = "list") {
		this._asks.push(this.preparePromptObj(name, type, 'Select a Target Endpoint:', APIProxy.getTargetEndpoints()));
	}

	selectPolicy(name = "policy", type = "list") {
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

	addCustom(promptObj) {
		this._asks.push(promptObj);
	}

	show() {
		return new Promise((resolve, reject) => {
			try {
				this._vorpal.prompt(this._asks, (result) => {
					if(result.editor) result.editor = this._listEditors[result.editor];
					resolve(result);
				});
			} catch(e) {
				reject(e);
			}
		});
	}

}

module.exports = Prompt;