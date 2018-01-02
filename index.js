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

global.prefs = new Preferences('edge-client',{live: false});
global.chalk = vorpal.chalk;
global.prompt = vorpal.prompt;
global.output = new Output(vorpal);
// Watcher
global.watcher = new Watcher(["./.tmpWatcher/", "./apiproxy/"], vorpal);
watcher.start();

clear();
global.output.titleRandom(figlet.textSync("EDGE CLI", { horizontaleLayout: 'full'}));

for (var i = 0; i < commands.length; i++) {
	commands[i].injectCommand(vorpal);
}

vorpal.history('edge-client');
vorpal
  .delimiter((fs.existsSync("./apiproxy")) ? global.chalk.green(APIProxyHelper.getInfo().name + "$") : 'edge$')
  .use(less)
  .show();