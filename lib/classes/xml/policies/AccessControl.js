const XmlLive = require("../XmlLive");
const TagFactory = require("../TagFactory");
const Prompt = require("../../core/ui/Prompt");

class AccessControl extends XmlLive {
	constructor() {
		super();
		this._name = "";
		this._displayName = "";
		this._vorpal = "";
		this._ipRules = [];
		this._validateBasedOn = "";
		this._xml = "";
		this._prompt = null;
	}

	async initQuestion(vorpal, name = "") {
		this._name = name;
		this._displayName = "";
		this._vorpal = vorpal;
		this._prompt = new Prompt(this._vorpal);
		this._ipRules = [];
		this._validateBasedOn = "";
		this._xml = "";
		await this.askBegin();
		return this._xml;
	}

	async askBegin() {
		this._prompt.input('name', 'Enter the name:', {when: (answer) => this._name == ""});
		this._prompt.input('displayName', 'Enter the Display Name:');

		let result = await this._prompt.show();

		if(result.name) this._name = result.name;
		this._displayName = result.displayName;

		this._prompt.clean();
		await this.askNoMatchRule();
	}

	async askNoMatchRule() {
		this._prompt.list('type', 'Select no match rule for ipRules:', ['Allow', 'Deny']);
		let result = await this._prompt.show();

		this._ipRules.push({noMatchRule: result.type, matchRules: []});

		this._prompt.clean();
		await this.askType();
	}

	async askType() {
		this._prompt.list('type', 'Select type match rule:', ['Allow', 'Deny']);
		let result = await this._prompt.show();

		let matchRule = {type: result.type, ips: []};
		this._ipRules[this._ipRules.length - 1].matchRules.push(matchRule);

		this._prompt.clean();
		await this.askIp();
	}

	async askIp() {
		this._prompt.input('ip', 'Enter the ip match:');
		this._prompt.input('mask', 'Enter the mask:');

		let result = await this._prompt.show();

		let ip = {mask: result.mask, ip: result.ip};
		this._ipRules[this._ipRules.length - 1].matchRules[this._ipRules[this._ipRules.length - 1].matchRules.length - 1].ips.push(ip);
		this._prompt.clean();
		await this.askContinue();
	}

	async askContinue() {
		this._prompt.list('continue', 'Select continue:', ['Another Ip Rule', 'Another Match Rule', 'Another Ip', 'Continue to finish']);
		let result = await this._prompt.show();

		if(result.continue === 'Another Ip Rule') {
			await this.askNoMatchRule();
		} else if(result.continue === 'Another Match Rule') {
			await this.askType();
		} else if(result.continue === 'Another Ip') {
			await this.askIp();
		} else if (result.continue === 'Continue to finish') {
			await this.askValidateBasedOn();
		}
	}

	async askValidateBasedOn() {
		this._prompt.list('validateBasedOn', 'Select Validation Based On:', ['For all IP', 'For first IP', 'For last IP']);
		let result = await this._prompt.show();

		if(result.validateBasedOn === 'For all IP') {
			this._validateBasedOn = "X_FORWARDED_FOR_ALL_IP";
		} else if(result.validateBasedOn === 'For first IP') {
			this._validateBasedOn = "X_FORWARDED_FOR_FIRST_IP";
		} else if(result.validateBasedOn === 'For last IP') {
			this._validateBasedOn = "X_FORWARDED_FOR_LAST_IP";
		}

		this.generateXml();
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
		this._xml = this.toXml();
	}
}

module.exports = AccessControl;