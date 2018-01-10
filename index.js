#! /usr/bin/env node
const vorpal = require('vorpal')();
const clear = require("clear");
const figlet = require("figlet");
const Preferences = require("preferences");
const Watcher = require("./lib/classes/core/Watcher");
const Output = require("./lib/classes/core/helpers/Output");
const fs = require("fs-plus");
const APIProxyHelper = require('./lib/classes/core/helpers/APIProxy');
const less = require('vorpal-less');

// Command Classes
let commands = []
fs.readdirSync(__dirname + '/lib/commands/').forEach(function(file) {
  if (file.match(/\.js$/) !== null && file !== 'index.js') {
    commands.push(require(__dirname + '/lib/commands/' + file));
  }
});

let delimeter = "edge";
let history = "edge-client";
let preferences = "edge-client";
if(fs.existsSync("./apiproxy")) {
	apiproxyName = APIProxyHelper.getInfo().name;
	delimeter = apiproxyName;
	history += `-${apiproxyName}`;
	preferences += `-${apiproxyName}`; 
}

global.prefs = new Preferences(preferences,{live: {validation: true, upload: false}});
global.chalk = vorpal.chalk;
global.prompt = vorpal.prompt;
global.output = new Output(vorpal);
global.watcher = new Watcher(vorpal);

clear();
global.output.titleRandom(figlet.textSync("EDGE CLI", { horizontaleLayout: 'full'}));
console.log(process.env.ENV_VARIABLE);

for (var i = 0; i < commands.length; i++) commands[i].injectCommand(vorpal);

vorpal.history(history);
vorpal
  .delimiter(global.chalk.green(`${delimeter}$`))
  .use(less)
  .show();