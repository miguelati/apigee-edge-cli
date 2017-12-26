#! /usr/bin/env node
const vorpal = require('vorpal')();
const clear = require("clear");
const CLI = require("clui");
const figlet = require("figlet");
const Spinner = CLI.Spinner;
const touch = require("touch");
const Preferences = require("preferences");
const Watcher = require("./lib/classes/core/Watcher");
const Output = require("./lib/classes/core/helpers/Output");

// Command Classes
let commands = []
require("fs-plus").readdirSync(__dirname + '/lib/commands/').forEach(function(file) {
  if (file.match(/\.js$/) !== null && file !== 'index.js') {
    commands.push(require(__dirname + '/lib/commands/' + file));
  }
});

global.prefs = new Preferences('edge-client',{});
global.localStorage = vorpal.localStorage;
global.chalk = vorpal.chalk;
global.prompt = vorpal.prompt;
global.output = new Output();

// To edit
let watcher = new Watcher("./.tmpWatcher/", vorpal);
watcher.start();

clear();
global.output.titleRandom(figlet.textSync("EDGE CLI", { horizontaleLayout: 'full'}));

for (var i = 0; i < commands.length; i++) {
	commands[i].injectCommand(vorpal);
}

const exit = vorpal.find('exit')
if (exit) {
  exit.remove()
}

vorpal
  .command('exit')
  .alias('quit')
  .option('-f, --force', 'Forces process kill without confirmation.')
  .description('Exits this instance of cbcluster')
  .action(function (args) {
    watcher.stop();
    args.options = args.options || {}
    args.options.sessionId = this.session.id
    this.parent.exit(args.options)
  })

vorpal.history('edge-client');
vorpal
  .delimiter('edge$')
  .show();

