//const fromXML = require("from-xml").fromXML;
const toXML = require("to-xml").toXML;
const fs = require("fs-plus");
const _ = require("lodash");

class XmlLive {
	constructor() {
		this.attributes = {};
		this.tags = [];
		this._content = "";
		this._baseTag = new.target.name;
		this._xml = "";
	}

	addAttr(key, value) {
		this.attributes[key] = value;
	}

	removeAttr(key) {
		delete this.attributes[key];
	}

	addTag(tag) {
		this.tags.push(tag);
	}

	findTag(tagName) {
		for (var i = 0; i < this.tags.length; i++) {
			if (this.tags[i]._baseTag === tagName) {
				return this.tags[i];
			}
		}
		return null;
	}

	replaceTag(tagName, newTag) {
		for (var i = 0; i < this.tags.length; i++) {
			if (this.tags[i]._baseTag === tagName) {
				this.tags[i] = newTag;
				return true;
			}
		}
		return false;
	}

	get content() {
		return this._content;
	}

	set content(value) {
		this._content = value;
	}

	removeTag(tag) {
		for (var i = 0; i < this.tags.length; i++) {
			if (JSON.stringify(this.tags[i]) === JSON.stringify(tag)) {
				this.tags.splice(i, 1);
			}
		}
	}

	groupByTag(tags) {
		let json = {};

		for(let index in this.tags) {
			if(!json.hasOwnProperty(this.tags[index]._baseTag)) {
				json[this.tags[index]._baseTag] = [];
			}
			json[this.tags[index]._baseTag].push(this.tags[index].toJson());
		}
		return json;
	}

	toXml() {
		return toXML(this.toJson(true), null, 2);
	}

	toJson(xmlHeader = false) {
		let json = {};
		let jsonMain = {};
		if(xmlHeader) {
			json["?"] = "xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"";
			json[this._baseTag] = {};
		}

		
		for(let attr in this.attributes) {
			jsonMain["@" + attr] = this.attributes[attr]; 
		}

		if(_.isString(this._content)) {
			jsonMain["#"] = this._content;
		} else if (_.isNull(this._content) || _.isUndefined(this._content)) {
			jsonMain = null;
		}

		if(this.tags.length == 1) {
			jsonMain[this.tags[0]._baseTag] = this.tags[0].toJson();
		} else if(this.tags.length > 1) {
			jsonMain = _.merge(jsonMain, this.groupByTag(this.tags));
		}

		if (xmlHeader) {
			json[this._baseTag] = jsonMain
			return json;
		} else {
			return jsonMain;
		}
	}
}

module.exports = XmlLive;