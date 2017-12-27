const XmlLive = require("../XmlLive");
const TagFactory = require("../TagFactory");

class AccessControl extends XmlLive {
	constructor() {
		super();
		this._name = "";
		this._callback = "";
		this._displayName = "";
		this._vorpal = "";
		this._ipRules = [];
		this._validateBasedOn = "";
	}

	initQuestion(vorpal, name = "", callback) {
		this._name = name;
		this._callback = callback;
		this._displayName = "";
		this._vorpal = vorpal;
		this._ipRules = [];
		this._validateBasedOn = "";
		this.askBegin();
	}

	askBegin() {
		let questions = [
			{type: 'input', name: 'name', message: 'Enter the name:', when: (answer) => this._name == ""},
			{type: 'input', name: 'displayName', message: 'Enter the Display Name:'}
		];
		this._vorpal.prompt(questions, (result) => {
			if(result.name) {
				this._name = result.name;
			}
			this._displayName = result.displayName;
			this.askNoMatchRule();
		});
	}

	askNoMatchRule() {
		this._vorpal.prompt({type: 'list', name: 'type', message: 'Select no match rule for ipRules:', choices: ['Allow', 'Deny']}, (result) => {
			this._ipRules.push({noMatchRule: result.type, matchRules: []});
			this.askType();
		});
	}

	askType() {
		this._vorpal.prompt({type: 'list', name: 'type', message: 'Select type match rule:', choices: ['Allow', 'Deny']}, (result) => {
			let matchRule = {type: result.type, ips: []};
			this._ipRules[this._ipRules.length - 1].matchRules.push(matchRule);
			this.askIp();
		});
	}

	askIp() {
		let questions = [
			{type: 'input', name: 'ip', message: 'Enter the ip match:'},
			{type: 'input', name: 'mask', message: 'Enter the mask:'}
		];
		this._vorpal.prompt(questions, (result) => {
			let ip = {mask: result.mask, ip: result.ip};
			this._ipRules[this._ipRules.length - 1].matchRules[this._ipRules[this._ipRules.length - 1].matchRules.length - 1].ips.push(ip);
			this.askContinue();
		});
	}

	askContinue() {
		this._vorpal.prompt({type: 'list', name: 'continue', message: 'Select continue:', choices: ['Another Ip Rule', 'Another Match Rule', 'Another Ip', 'Continue to finish']}, (result) => {
			if(result.continue === 'Another Ip Rule') {
				this.askNoMatchRule();
			} else if(result.continue === 'Another Match Rule') {
				this.askType();
			} else if(result.continue === 'Another Ip') {
				this.askIp();
			} else if (result.continue === 'Continue to finish') {
				this.askValidateBasedOn();
			}
		});
	}

	askValidateBasedOn() {
		this._vorpal.prompt({type: 'list', name: 'validateBasedOn', message: 'Select Validation Based On:', choices: ['For all IP', 'For first IP', 'For last IP']}, (result) => {
			if(result.validateBasedOn === 'For all IP') {
				this._validateBasedOn = "X_FORWARDED_FOR_ALL_IP";
			} else if(result.validateBasedOn === 'For first IP') {
				this._validateBasedOn = "X_FORWARDED_FOR_FIRST_IP";
			} else if(result.validateBasedOn === 'For last IP') {
				this._validateBasedOn = "X_FORWARDED_FOR_LAST_IP";
			}
			this.generateXml();
		});
	}

	generateXml() {
		this.async = "true";
		this.continueOnError = "true";
		this.enabled = "true";
		this.name = this._name;
		this.addDisplayName(this._displayName);
		
		for(let indexRules in this._ipRules) {
			let matchesRules = [];  
			for(let indexMatch in this._ipRules[indexRules].matchRules) {
				let matchRule = new TagFactory("MatchRule");
				matchRule.action = this._ipRules[indexRules].matchRules[indexMatch].type.toUpperCase();
				
				for(let indexIps in this._ipRules[indexRules].matchRules[indexMatch].ips) {
					let sourceAddress = this._ipRules[indexRules].matchRules[indexMatch].ips[indexIps];
					matchRule.addSourceAddress({attr: {mask: sourceAddress.mask}, content: sourceAddress.ip});
				}

				matchesRules.push(matchRule);
			}

			this.addIPRules({attr: {noRuleMatchAction: this._ipRules[indexRules].noMatchRule.toUpperCase()}, content: matchesRules})
		}
		this.addValidateBasedOn(this._validateBasedOn);
		this._callback(this.toXml());
	}
}

module.exports = AccessControl;