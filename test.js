class Test {
	constructor() {
		this._name;
	}

	get name() {
		return this._name;
	}

	set name(content) {
		this._name = content;
	}
}

var handler = {
  get: function(target, name){
    return name in target ? target[name] : 42;
}};


var assignMessage = new Proxy(Test, handler);

console.log(assignMessage);

var lol = new assignMessage

lol.name = "as"

console.log(lol.name, lol.otro)