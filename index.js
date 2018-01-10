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
const _ = require('lodash');

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

let defaults = {apigee: {}, live: {validation: true, upload: false}};

if(!_.isEmpty(process.env.APIGEE_USERNAME)) defaults.apigee.username = process.env.APIGEE_USERNAME;
if(!_.isEmpty(process.env.APIGEE_PASSWORD)) defaults.apigee.password = process.env.APIGEE_PASSWORD; 
if(!_.isEmpty(process.env.API_ORGANIZATION)) defaults.apigee.organization = process.env.API_ORGANIZATION; 

global.prefs = new Preferences(preferences, defaults);
global.chalk = vorpal.chalk;
global.prompt = vorpal.prompt;
global.output = new Output(vorpal);
global.watcher = new Watcher(vorpal);

clear();
global.output.titleRandom(figlet.textSync("EDGE CLI", { horizontaleLayout: 'full'}));
console.log();

for (var i = 0; i < commands.length; i++) commands[i].injectCommand(vorpal);

vorpal.history(history);
vorpal
  .delimiter(global.chalk.green(`${delimeter}$`))
  .use(less)
  .show();