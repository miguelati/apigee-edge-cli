
var TagFactory = require('./lib/classes/xml/TagFactory');


var assignMessage = new TagFactory("AssignMessage");
assignMessage.async = "false";
assignMessage.continueOnError = "false";
assignMessage.enabled = "true";
assignMessage.name = "AssignSuccessResponse";

var a = new TagFactory("Manola");
a.test = "a";
a.content = "lalala";

assignMessage.addHolaInKiketal(a);
assignMessage.addDisplayName("AssignSuccessResponse");
assignMessage.addProperties(null);

let payload = new TagFactory("Payload");
payload.variablePrefix = "%";
payload.variableSuffix = "#";
payload.content = `{
        "status":"OK",
        "validMFSaccount":"true"
        }`;
assignMessage.addSet(payload);

assignMessage.addReasonPhraseInSet("OK");
assignMessage.addStatusCodeInSet("200");

let vari = new TagFactory("Variable");
vari.name = "hola";
vari.content = "value";

assignMessage.addVariables(vari);

assignMessage.addIgnoreUnresolvedVariables("true");

console.log(assignMessage.toXml());


/*let proxyEndpoint = new TagFactory("ProxyEndpoint");
proxyEndpoint.name = "default";
proxyEndpoint.addDescription(null);

let faultRule = new TagFactory("FaultRule");
faultRule.name = "InvalidAPICallAsNoApiProductMatchFound";
faultRule.addCondition("fault.name = \"InvalidAPICallAsNoApiProductMatchFound\"");

let stepFault = new TagFactory("Step");
stepFault.addFaultRules(null);
stepFault.addName("InvalidAccessTokenPolicy");

faultRule.addTag(stepFault);


let faultRule2 = new TagFactory("FaultRule");
faultRule2.name = "NullAccessTokenForRegisteredUser";


proxyEndpoint.addFaultRules(faultRule, faultRule2);

console.log(proxyEndpoint.toXml());
/*
console.log("============ >>>> ======== <<<< ============");

let targetEndpoint = new TagFactory("TargetEndpoint");
targetEndpoint.name = "default";
targetEndpoint.addDescription();

let faultRule = new TagFactory("FaultRule");
faultRule.name = "BackendError";
faultRule.addCondition("message.status.code = 503");
faultRule.addNameInStep("Fault.BackEndUnAvailable");

targetEndpoint.addFaultRules(faultRule);

let step1 = new TagFactory("Step");
step1.addName("AssignTargetUrl");

let step2 = new TagFactory("Step");
step2.addName("SetTargetUrl");

let step3 = new TagFactory("Step");
step3.addName("ConstructSOAPRequest-SLV");
step3.addCondition("urirequest.country = \"SLV\"");

let step4 = new TagFactory("Step");
step4.addName("ConstructSOAPRequest-HND");
step4.addCondition("urirequest.country = \"HND\"");

let step5 = new TagFactory("Step");
step5.addName("ConstructSOAPRequest-PRY");
step5.addCondition("urirequest.country = \"PRY\"");

let request = new TagFactory("Request");
request.addTag(step1);
request.addTag(step2);
request.addTag(step3);
request.addTag(step4);
request.addTag(step5);

let step6 = new TagFactory("Step");
step6.addName("XMLtoJSON");

let step7 = new TagFactory("Step");
step7.addName("ExtractStatus");

let step8 = new TagFactory("Step");
step8.addName("AssignSuccessResponse");
step8.addCondition("((urirequest.country = \"SLV\" and res.Userstatus = \"Active\") || ((urirequest.country = \"PRY\" || urirequest.country = \"HND\") and res.status = \"OK\"))");

let step9 = new TagFactory("Step");
step9.addName("InvalidUserPolicy");
step9.addCondition("(urirequest.country = \"SLV\" and res.Userstatus = \"Inactive\")");

let step10 = new TagFactory("Step");
step10.addName("AssignFaultMessage");
step10.addCondition("!(res.status = \"OK\")");

let step11 = new TagFactory("Step");
step11.addName("Assign404NotFoundCode");
step11.addCondition("!(res.status = \"OK\")");

let response = new TagFactory("Response");
response.addTag(step6);
response.addTag(step7);
response.addTag(step8);
response.addTag(step9);
response.addTag(step10);
response.addTag(step11);

targetEndpoint.addPreFlow({attr: {"name": "PreFlow"}, content: [request, response]});

let request2 = new TagFactory("Request");
request2.content = null;

let step12 = new TagFactory("Step");
step12.addName("AssignOriginalVerb");

let response2 = new TagFactory("Response");
response2.addTag(step12);

targetEndpoint.addPostFlow({attr: {"name": "PostFlow"}, content: [request2, response2]});

let properties = new TagFactory("Properties");
properties.addProperty({attr: {name: "success.codes"}, content: "2XX,4XX,500"}, {attr: {name: "keepalive.timeout.millis"}, content: "60000"}, {attr: {name: "connect.timeout.millis"}, content: "3000"}, {attr: {name: "io.timeout.millis"}, content: "120000"});

let url = new TagFactory("URL");
url.content = "https://devapi.tigo.com.sv/TigoAPIMFS/GetUserDetails/V3";

targetEndpoint.addHTTPTargetConnection(properties, url);

console.log(targetEndpoint.toXml());

console.log("============ >>>> ======== <<<< ============");

let apiProxy = new TagFactory("ApiProxy");
apiProxy.revision = "4";
apiProxy.name = "TigoMoneyAccountStatusService";

apiProxy.addBasepaths("/v1/tigo/mfs/payments/accounts");
apiProxy.addConfigurationVersions({attr: {majorVersion: 4, minorVersion: 0}});
apiProxy.addCreatedAt("1463042124059");
apiProxy.addCreatedBy("radhika_talluri@thbs.com");
apiProxy.addDescription();
apiProxy.addDisplayName("TigoMoneyAccountStatusService");
apiProxy.addLastModifiedAt("1470742957013");
apiProxy.addLastModifiedBy("radhika_talluri@thbs.com");


apiProxy.addPolicyInPolicies("Assign404NotFoundCode",
    "AssignFaultMessage",
    "AssignOriginalVerb",
    "AssignSuccessResponse",
    "AssignTargetUrl",
    "ConstructSOAPRequest-HND",
    "ConstructSOAPRequest-PRY",
    "ConstructSOAPRequest-SLV",
    "ExpiredAccessTokenPolicy",
    "ExtractPathParameters",
    "ExtractStatus",
    "Fault.BackEndUnAvailable",
    "InvalidAccessPolicy",
    "InvalidAccessTokenPolicy",
    "InvalidCountryPolicy",
    "InvalidMethodPolicy",
    "InvalidProtocolPolicy",
    "InvalidUserPolicy",
    "MissingAuthorizationHeaderPolicy",
    "RegularExpressionProtectionTransactionStatus",
    "ReqularExpressionThreatProtection",
    "ResourceNotFound",
    "ReturnGenericError",
    "SetTargetUrl",
    "VerifyAccessTokenPolicy",
    "XMLtoJSON");
apiProxy.addProxyEndpointInProxyEndpoints("default");
apiProxy.addResourceInResources("jsc://setTargetUrl.js");
apiProxy.addSpec();
apiProxy.addTargetServers();
apiProxy.addTargetEndpointInTargetEndpoints("default");
apiProxy.addvalidate("false");

console.log(apiProxy.toXml());*/
