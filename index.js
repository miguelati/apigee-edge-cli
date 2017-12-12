
const clear = require("clear");
const CLI = require("clui");
const figlet = require("figlet");
const Spinner = CLI.Spinner;
const touch = require("touch");
const vorpal = require('vorpal')();
const chalk = vorpal.chalk;
const Preferences = require("preferences");
// Command Classes
const InitCommand = require('./lib/commands/init');
const RewirteCommand = require('./lib/commands/rewrite');
const ApiproxyCommand = require('./lib/commands/apiproxy');
const DownloadCommand = require('./lib/commands/download');




clear();
console.log(
	chalk.yellow(
		figlet.textSync("EDGE CLI", { horizontaleLayout: 'full'})
	)
);

global.prefs = new Preferences('com.edge-client',{});
vorpal.localStorage('edge-cli');


let commands = [InitCommand, RewirteCommand, ApiproxyCommand, DownloadCommand];

for (var i = 0; i < commands.length; i++) {
	commands[i].injectCommand(vorpal);
}

vorpal
  .delimiter('edge$')
  .show();
