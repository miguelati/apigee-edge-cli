
var clear = require("clear");
var CLI = require("clui");
var figlet = require("figlet");
var Preferences = require("preferences");
var Spinner = CLI.Spinner;
var _ = require("lodash");
var touch = require("touch");
var files = require("./lib/files");
const vorpal = require('vorpal')();
const chalk = vorpal.chalk;
var SwaggerParser = require('swagger-parser');
var fs = require("fs-plus");
// Xml Classes
var Step = require('./lib/classes/xml/Step');
var Flow = require('./lib/classes/xml/Flow');
var FaultRule = require('./lib/classes/xml/FaultRule');
var ApiProxy = require('./lib/classes/xml/ApiProxy');
var HTTPProxyConnection = require('./lib/classes/xml/HTTPProxyConnection');
var RouteRule = require('./lib/classes/xml/RouteRule');
var ProxyEndpoint = require('./lib/classes/xml/ProxyEndpoint');
var TargetEndpoint = require('./lib/classes/xml/TargetEndpoint');
var HTTPTargetConnection = require('./lib/classes/xml/HTTPTargetConnection');
var AccessControl = require('./lib/classes/xml/policies/AccessControl');

clear();
console.log(
	chalk.yellow(
		figlet.textSync("EDGE", { horizontaleLayout: 'full'})
	)
);

vorpal
  .command('init', 'Load swagger and create proxy with specs')
  .action(function(args, callback) {


    var accessControl = new AccessControl({name: "Test-Access-1", displayName: "Test Access 1"});
    accessControl.addIpRule({name: "ip-new", mask: "32", ip: "10.1.1.1"});
    accessControl.addIpRule({name: "ip-new2", mask: "16", ip: "10.1.1.10"});

    console.log(accessControl.getXml());
    
    
    /*var fault = new FaultRule({name: "Test1"});
    fault.condition = "name == 1"
    var step = new Step({name: "Step 1"});
    step.condition = "name3 == 1";
    fault.addStep(step);
    fault.addStep(new Step({name:"Step2"}));
    fault.addStep(new Step({name:"Step3"}));
    
    console.log(fault.getXml());*/

    /*var flow = new Flow({name: "Test1"});
    flow.pathCondition("/v1/tigo/home/billing/* /country", "get");
    var step = new Step({name: "Step 1"});
    step.condition = "name3 is 1";
    flow.addStepToResponse(step);
    flow.addStepToResponse(new Step({name:"Step2"}));
    flow.addStepToResponse(newexit Step({name:"Step3"}));
    flow.addStepToRequest(new Step({name:"Step1"}));
    flow.addStepToRequest(new Step({name:"Step2"}));

    console.log(flow.getXml());*/

    /*var apiproxy = new ApiProxy({name: "test"});
    apiproxy.basepaths = "/v1/tigo/money/"
    apiproxy.displayName = "tigo_billing_v1"
    apiproxy.createdAt = new Date();
    apiproxy.createdBy = "Miguel Godoy";
    apiproxy.lastModifiedAt = new Date();
    apiproxy.lastModifiedBy = "Miguel Godoy";
    apiproxy.description = "Changin variablename from tigoId check token";

    for(var i = 0; i < 20; i++) {
      apiproxy.addPolicy("Policy-version-" + i);
    }

    apiproxy.addProxyEndpoint("ProxyEndpoint-1");
    
    for(var i = 0; i < 20; i++) {
      apiproxy.addResource("jsc://script" + i + ".js");
    }

    for(var i = 0; i < 6; i++) {
      apiproxy.addTargetEndpoint("TargetEndpoint-" + i);
    }



    console.log(apiproxy.getXml());*/

    /*var proxy = new TargetEndpoint({name: "ProxyEndpoint1"});
    proxy.description = "Test para ver que funciona";
    proxy.addStepToDefaultFaultRule(new Step({name: "DefaultFaultRule 1", condition: "proxy1 == 'test'"}));
    proxy.addStepToDefaultFaultRule(new Step({name: "DefaultFaultRule 2", condition: "proxy2 == 'hola'"}));
    proxy.addFaultRule(new FaultRule({name: "Hola", condition:"request.content <> ''", step: [new Step({name: "Step Fault Rule 1"}), new Step({name: "Step Fault Rule 1"})]}));
    proxy.addStepToPreFlowRequest(new Step({name: "Login-Test"}));
    proxy.addStepToPreFlowResponse(new Step({name: "XML-to-Json"}));
    proxy.addStepToPostFlowRequest(new Step({name: "Step preflow request"}));
    proxy.addStepToPostFlowResponse(new Step({name: "Step postflow request"}));
    
    var flow = new Flow({name: "Flow 1"});
    flow.description = "para ver que onda";
    flow.pathCondition("/v1/tigo/money/", "post");
    flow.addStepToResponse(new Step({name: "validation-data"}));
    flow.addStepToRequest(new Step({name: "process-data"}));

    proxy.addFlow(flow);

    var httpTargetConnection = new HTTPTargetConnection({basepath: "/v1/tigo/mobile/"});
    httpTargetConnection.addProperty({name: "request.retain.headers", value: "User-Agent,Referer,Accept-Language"});
    httpTargetConnection.addProperty({name: "retain.queryparams.enabled", value: "false"});
    httpTargetConnection.addProperty({name: "target.copy.pathsuffix", value: "false"});
    

    proxy.addHttpTargetConnection(httpTargetConnection);
    

    console.log(proxy.getXml());
    */

    callback();
    /*
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

        auxVorpal.delimiter(chalk.green(api.info.title + "$"));
        
        
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
