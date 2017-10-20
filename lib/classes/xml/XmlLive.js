const fromXML = require("from-xml").fromXML;
const toXML = require("to-xml").toXML;
const dotty = require("dotty");
const fs = require("fs-plus");
const _ = require("lodash");

class XmlLive {
	constructor() {
		this._loadFileXml = "";
		this._baseTag = "";
		this._xmlLoaded = "";
		this._xml = "";
		this._json = {};
	}

	mapFields(map) {
		this._map = map;
		this.loadTemplate();
	}

	prepareJsonInline(collection) {
		return (collection.length > 0) ? collection.map( el => el.getJsonInline() ) : [];
	}

	loadTemplate() {
		this._loadFileXml = (this._loadFileXml == "") ? __dirname + "/../../../templates/"+ this._templateName +".xml" : this._loadFileXml;
		this._xmlLoaded = fs.readFileSync(this._loadFileXml).toString()
		this.reload();
	}

	syncXmlNode(result, path, privateField) {
		let resultValue = dotty.get(result, path);

		if (resultValue !== null && this[privateField] === "") this[privateField] = resultValue;
		else dotty.put(result, path, this[privateField]);
	}

	reload() {
		this._json = fromXML(this._xmlLoaded);

		for (let path in this._map) this.syncXmlNode(this._json, this._baseTag +"."+ path, this._map[path]);
		
		this._xml = toXML(this._json, null, 2);
	}

	getXml() {
		this.reload();
		return this._xml;
	}

	getJsonInline() {
		this.reload();
		let json = dotty.get(this._json, this._baseTag);
		let jsonKeysFiltered = Object.keys(json).filter((key) => !/^@.*/.test(key) && !_.isEmpty(json[key]));
		return _.pick(json, jsonKeysFiltered);
	}

	getJson() {
		this.reload();
		return this._json;
	}
}

module.exports = XmlLive;