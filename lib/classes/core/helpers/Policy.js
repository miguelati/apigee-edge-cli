const fs = require("fs-plus");
const fromXML = require("from-xml").fromXML;
const toXML = require("to-xml").toXML;
const _ = require("lodash");

class Policy {
	constructor(policyName) {
		this._name = policyName;
		this._json = this.openPolicyXML();
		this.type = this.getType();
	}

	openPolicyXML() {
		let content = fs.readFileSync(`./${global.actualRevision}/apiproxy/policies/${this._name}.xml`, 'utf8');
		return fromXML(content);
	}

	getType() {
		let obj = _.filter(Object.keys(this._json), (item) => item != "?");
		return obj[0];
	}

	getName() {
		return this._json[this.type]["@name"];
	}

	setName(namePolicy) {
		this._name = namePolicy;
		this._json[this.type]["@name"] = namePolicy;
		this.save();
	}

	save() {
		let xml = toXML(this._json, null, 2);
		fs.writeFileSync(`./${global.actualRevision}/apiproxy/policies/${this._name}.xml`, xml, { encoding: 'utf8'});
	}
}

module.exports = Policy