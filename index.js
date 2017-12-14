const vorpal = require('vorpal')();
const clear = require("clear");
const CLI = require("clui");
const figlet = require("figlet");
const Spinner = CLI.Spinner;
const touch = require("touch");
const Preferences = require("preferences");

// Command Classes
let commands = []
require('fs').readdirSync(__dirname + '/lib/commands/').forEach(function(file) {
  if (file.match(/\.js$/) !== null && file !== 'index.js') {
    //var name = file.replace('.js', '');
    commands.push(require(__dirname + '/lib/commands/' + file));
  }
});

global.prefs = new Preferences('edge-client',{});
global.localStorage = vorpal.localStorage;
global.chalk = vorpal.chalk;

clear();
console.log(
	global.chalk.yellow(
		figlet.textSync("EDGE CLI", { horizontaleLayout: 'full'})
	)
);

for (var i = 0; i < commands.length; i++) {
	commands[i].injectCommand(vorpal);
}

vorpal.history('edge-client');

vorpal
  .delimiter('edge$')
  .show();