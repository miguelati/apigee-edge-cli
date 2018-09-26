const XmlLive = require("../XmlLive");
const TagFactory = require("../TagFactory");
const Prompt = require("../../core/ui/Prompt");
const APIProxyHelper = require("../../core/helpers/APIProxy");
const fs = require("fs-plus");

class Javascript extends XmlLive {
	constructor() {
		super();
		this._name = "";
		this._displayName = "";
		this._xml = "";
		this._resourceUrl = "";
		this._listJsc = [];
		this._includeUrls = [];
		this._prompt = null;
	}

	async init(name = "", displayName = "") {
		this._name = name;
		this._displayName = displayName;
		this._listJsc = [];
		this._prompt = new Prompt();
		this._resourceUrl = "";
		this._includeUrls = [];
		this._xml = "";
		await this.beginProcess();
		return this._xml;
	}

	async beginProcess() {
		await this.askResourceUrl();
		this.generateXml();
	}

	async askResourceUrl() {
		this._listJsc = APIProxyHelper.getResources().filter(item => item.startsWith("jsc://")).map(item => item.replace("jsc://", ""))

		let listJscWithNew = this._listJsc
		listJscWithNew.unshift('New Script');
		
		this._prompt.input('name', 'Enter the name:', {when: (answer) => this._name == ""});
		this._prompt.input('displayName', 'Enter the Display Name:');
		this._prompt.list('resourceUrl', 'Select Resource URL:', listJscWithNew);
		this._prompt.input('newScript', 'Enter new script name:', {when: (answer) => answer.resourceUrl == 'New Script'})
		this._prompt.confirm('addIncludeUrl', 'Add other Include URL?');

		let result = await this._prompt.show();

		if(result.name) this._name = result.name;
		this._displayName = result.displayName;
		

		this._prompt.clean();
		if(result.resourceUrl == 'New Script') {
			fs.writeFileSync(`./${global.actualRevision}/apiproxy/resources/jsc/${result.newScript}`, "", { encoding: 'utf8'});
			this._resourceUrl = `jsc://${result.newScript}`;
		} else {
			this._resourceUrl = `jsc://${result.resourceUrl}`;
		}
		if(result.addIncludeURL) await this.askIncludeUrls();
	}

	async askIncludeUrls() {
		this._prompt.list('includeUrls', 'Select Include URL:', this._listJsc);
		this._prompt.confirm('continue', 'Add other Include URL?');

		let result = await this._prompt.show();
		this._includeUrls.push(`jsc://${result.includeUrls}`);
		if(result.continue) await this.askIncludeUrls();
	}

	generateXml() {
		this.async = "true";
		this.continueOnError = "true";
		this.enabled = "true";
		this.name = this._name;
		this.addDisplayName(this._displayName);
		this.addResourceURL(this._resourceUrl);
		
		for(index in this._includeUrls) {
			this.addIncludeURL(this._includeUrls[index]);
		}
		
		this._xml = this.toXml();
	}
}

module.exports = Javascript;