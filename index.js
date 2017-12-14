
const clear = require("clear");
const CLI = require("clui");
const figlet = require("figlet");
const Spinner = CLI.Spinner;
const touch = require("touch");
const vorpal = require('vorpal')();
const chalk = vorpal.chalk;
const Preferences = require("preferences");

// Command Classes
let commands = []
require('fs').readdirSync(__dirname + '/lib/commands/').forEach(function(file) {
  if (file.match(/\.js$/) !== null && file !== 'index.js') {
    //var name = file.replace('.js', '');
    commands.push(require(__dirname + '/lib/commands/' + file));
  }
});

clear();
console.log(
	chalk.yellow(
		figlet.textSync("EDGE CLI", { horizontaleLayout: 'full'})
	)
);

global.prefs = new Preferences('com.edge-client',{});
global.localStorage = vorpal.localStorage;

for (var i = 0; i < commands.length; i++) {
	commands[i].injectCommand(vorpal);
}

vorpal
  .delimiter('edge$')
  .show();
