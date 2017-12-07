
const clear = require("clear");
const CLI = require("clui");
const figlet = require("figlet");
const Preferences = require("preferences");
const Spinner = CLI.Spinner;
const _ = require("lodash");
const touch = require("touch");
const files = require("./lib/files");
const vorpal = require('vorpal')();
const chalk = vorpal.chalk;
const SwaggerParser = require('swagger-parser');
const fs = require("fs-plus");
// Xml Classes
const ApiProxy = require('./lib/classes/generates/ApiProxy');

clear();
console.log(
	chalk.yellow(
		figlet.textSync("EDGE", { horizontaleLayout: 'full'})
	)
);

vorpal
  .command('init', 'Load swagger and create proxy with specs')
  .action(function(args, callback) {

    var auxVorpal = this;
    var swaggers = fs.listSync("./", ["yaml", "json"]);

    var flowsProcess = function(path) {
      var flowTemplateRaw = fs.readFileSync(__dirname + "/templates/proxy_endpoint/FlowTemplate.xml");

      console.log(flowTemplateRaw.toString());
    };
    
    SwaggerParser.validate(swaggers[0])
      .then(function(api) {
        if(!fs.existsSync("./apiproxy")) {
          var dirs = ["./apiproxy/policies/", "./apiproxy/proxies/default/flows", "./apiproxy/resoruces/jsc", "./apiproxy/targets/default/flows"];
          var files = ["./apiproxy/" + api.info.title + ".xml", "./apiproxy/proxies/default/main.xml", "./apiproxy/targets/default/main.xml"];

          for (var i = 0; i < dirs.length; i++) {
            console.log(chalk.yellow("Create " + dirs[i]));
            fs.makeTreeSync(dirs[i]);
          }
          for (var i = 0; i < files.length; i++) {
            console.log(chalk.yellow("Create " + files[i]));
            touch.sync(files[i]);
          }
        } 
        ApiProxy.create(api);
        auxVorpal.delimiter(chalk.green(api.info.title + "$"));
        //console.log(JSON.stringify(api, null, 4));
        
        //console.log(api.paths);
        callback();
      })
      .catch(function(err) {
        console.error('Onoes! The API is invalid. ' + err.message);
        callback();
      });
      
    /*console.log(args);
    this.log('bar');
    this.log(files.getCurrentDirectoryBase());
    this.log(files.getCurrentPath());
    console.log("####");
    console.log(__dirname);
    */
    
  });


vorpal
  .delimiter('edge$')
  .show();
