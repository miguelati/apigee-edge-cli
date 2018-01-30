#! /usr/bin/env node
const vorpal = require('vorpal')();
const clear = require("clear");
const figlet = require("figlet");
const fs = require("fs-plus");
const APIProxyHelper = require('./lib/classes/core/helpers/APIProxy');
const less = require('vorpal-less');
const _ = require('lodash');
const Enviroment = require("./lib/classes/core/Enviroment");
const updateNotifier = require('update-notifier');
const pkg = require('./package.json');
const NewUpdate = require('./lib/classes/drawer/NewUpdate');
const CLI = require("clui");
const Spinner = CLI.Spinner;

// Command Classes
let commands = []
fs.readdirSync(__dirname + '/lib/commands/').forEach(function(file) {
  if (file.match(/\.js$/) !== null && file !== 'index.js') {
    commands.push(require(__dirname + '/lib/commands/' + file));
  }
});

Enviroment.init(vorpal);

clear();
global.output.titleRandom(figlet.textSync("APIGEE EDGE CLI", { horizontaleLayout: 'full'}));

for (var i = 0; i < commands.length; i++) commands[i].injectCommand(vorpal);

vorpal.history(global.apiproxyName);
var countdown = new Spinner(global.chalk.blue(`Check for updates in npm... `), ['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷']);
countdown.start();
updateNotifier({
	pkg,
	updateCheckInterval: 0, // 1 week
	callback: (error, update) => {
		if(update.latest > update.current)
			console.log(NewUpdate.draw(update.latest, update.current, update.type, update.name));
		countdown.stop();
		vorpal
		  .delimiter(global.chalk.green(Enviroment.delimiter()))
		  .use(less)
		  .show();
	}
}).notify()


