```
     _    ____ ___ ____ _____ _____   _____ ____   ____ _____    ____ _     ___ 
    / \  |  _ \_ _/ ___| ____| ____| | ____|  _ \ / ___| ____|  / ___| |   |_ _|
   / _ \ | |_) | | |  _|  _| |  _|   |  _| | | | | |  _|  _|   | |   | |    | | 
  / ___ \|  __/| | |_| | |___| |___  | |___| |_| | |_| | |___  | |___| |___ | | 
 /_/   \_\_|  |___\____|_____|_____| |_____|____/ \____|_____|  \____|_____|___|
```

`apigee-edge-cli` is a command line utility for interacting with
Apigee Apiproxies & Servers.

It was developed under commons situations that I was past.

## Installation

With NPM:

```
npm install -g apigee-edge-cli
```

From this repository:

```
git clone https://github.com/miguelati/apigee-edge-cli.git
cd apigee-edge-cli
npm install
npm link
```

## Usage

Start `edge`:

```
edge
```

Get help:

```
edge$ help

  Commands:

    help [command...]                    Provides help for a given command.
    apiproxy                             Information of actual apiproxy
    exit [options]                       Exits this instance of edge-client
    flow [options] <flowName>            Show the flow
    policy <policyName>                  Open policy xml
    proxyEndpoint <proxyEndpointName>    List all ProxyEndpoints
    settings                             Open policy xml
    targetEndpoint <targetEndpointName>  Details of a TargetEndpoint

  Command Groups:

    apiproxy *                           9 sub-commands.
    flow *                               1 sub-command.
    policy *                             1 sub-command.
    proxyEndpoint *                      3 sub-commands.
    settings *                           1 sub-command.
    targetEndpoint *                     3 sub-commands.
```

You can also get help for individual commands with `help <command>`.

### A note about defaults

For the sake of convenience, `apigee-edge-cli` includes some sensible defaults
and the defaults (for e.g. live.validation) which you will find in the
'settings' command:

| Default setting        | Value           | Notes                       |
| ---------------------- | --------------- | ----------------------------| 
| apigee.username | *Enviroments vars, answer when cli need or with command* | [string] can be overridden with `settings save apigee.username` |
| apigee.password | *Enviroments vars, answer when cli need or with command*     | [string] can be overridden with `settings save apigee.password` |
| apigee.organization | *Enviroments vars, answer when cli need or with command*     | [string] can be overridden with `settings save apigee.organization` |
| editor | *Answer when cli need or with command*     | [string] can be overridden with `settings save editor` |
| graph.withNames | *Default 'true' Change only with command*     | [boolean] can be overridden with `settings save graph.withNames` |
| live.validation | *Default 'true' Change only with command*     | [boolean] can be overridden with `settings save live.validation` |
| live.upload | *Default 'false' Change only with command*     | [boolean] can be overridden with `settings save live.upload` |

### Usage Examples

This example follows the [Apigee documentation](https://docs.apigee.com/) and covers most of the current abilities available in `apigee`.

#### Apigee-edge-cli Information

Determine the cli version & enviroment parameters :

```
edge$ info
┌───────────────────────────────────────┬─────────────────────────────────────┐
│ Apigee-edge-cli Version               │ 1.0.6                               │
├───────────────────────────────────────┼─────────────────────────────────────┤
│ Apiproxy name                         │ tigoid_query                        │
├───────────────────────────────────────┼─────────────────────────────────────┤
│ Apiproxy actual revision              │ 22                                  │
├───────────────────────────────────────┼─────────────────────────────────────┤
│ Apiproxies revisions downloads        │ 20,22,23,25                         │
└───────────────────────────────────────┴─────────────────────────────────────┘

```
Commands
===========================

### Command 'apiproxy'

##### apiproxy download

You can download the last apiproxy:

```
edge$ apiproxy download myApiproxy
Apiproxy myApiproxy revision 3 was downloaded!
myApiproxy(Rev3)$
```

or download with a specific revision number

```
myApiproxy(Rev3)$ apiproxy download myApiproxy 2
Apiproxy myApiproxy revision 2 was downloaded!
myApiproxy(Rev3)$
```

##### apiproxy change

You can change between revisions downloaded

```
myApiproxy(Rev3)$ apiproxy change 2
myApiproxy(Rev2)$
```

or 

```
myApiproxy(Rev2)$ apiproxy change
? Select revision:  (Use arrow keys)
  2
❯ 3
myApiproxy(Rev3)$
```


##### apiproxy compare

You can compare between two revisions that was downloaded

```
myApiproxy(Rev3)$ apiproxy compare
? Select revision A:  2
? Select revision B:  3
┌───────────────────────────────────────┬─────────────────────────────────────┐
│ Equals                                │ 20                                  │
├───────────────────────────────────────┼─────────────────────────────────────┤
│ Distinct                              │ 1                                   │
├───────────────────────────────────────┼─────────────────────────────────────┤
│ Revision 2                            │ 0                                   │
├───────────────────────────────────────┼─────────────────────────────────────┤
│ Revision 3                            │ 0                                   │
├───────────────────────────────────────┼─────────────────────────────────────┤
│ Differences                           │ 1                                   │
└───────────────────────────────────────┴─────────────────────────────────────┘
? select a file to compare or cancel: ./2/apiproxy/resources/jsc/test.js <> ./3/apiproxy/resources/jsc/test.js
@@ -1,1 +1,2 @@
+// Test
 var test = "";
 myApiproxy(Rev3)$
```


##### apiproxy proxyEndpoint

List all proxyEndpoints

```
myApiproxy(Rev3)$ apiproxy proxyEndpoint

ApiProxy: myApiproxy
Revision: 3


┌─────────────────────────────────────────────────────────────────────────────┐
│ default                                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
myApiproxy(Rev3)$
```

##### apiproxy targetEndpoint

List all targetEndpoints

```
myApiproxy(Rev3)$ apiproxy targetEndpoint

ApiProxy: myApiproxy
Revision: 3


┌─────────────────────────────────────────────────────────────────────────────┐
│ default                                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
myApiproxy(Rev3)$
```

##### apiproxy policies

Lista all policies

```
myApiproxy(Rev3)$ apiproxy policies

ApiProxy: myApiproxy
Revision: 3


┌─────────────────────────────────────────────────────────────────────────────┐
│ XmlToJson                                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ AssignMessage                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
myApiproxy(Rev3)$
```

##### apiproxy resources

Lista all resources

```
myApiproxy(Rev3)$ apiproxy resources

ApiProxy: myApiproxy
Revision: 3


┌─────────────────────────────────────────────────────────────────────────────┐
│ jsc://test.js                                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ jsc://lib.js                                                                │
└─────────────────────────────────────────────────────────────────────────────┘
myApiproxy(Rev3)$
```

### Command 'proxyEndpoint'

##### proxyEndpoint <name>

Show you all information about the proxyEndpoint

```
myApiproxy(Rev3)$ proxyEndpoint default

ApiProxy: myApiproxy
Revision: 3

┌───────────────────────────────────────┬─────────────────────────────────────┐
│ Name                                  │ default                             │
├───────────────────────────────────────┼─────────────────────────────────────┤
│ FaultRules                            │                                     │
├───────────────────────────────────────┼─────────────────────────────────────┤
│ PreFlow Request                       │ Login                               │
├───────────────────────────────────────┼─────────────────────────────────────┤
│ PreFlow Response                      │                                     │
├───────────────────────────────────────┼─────────────────────────────────────┤
│ PostFlow Request                      │                                     │
├───────────────────────────────────────┼─────────────────────────────────────┤
│ PostFlow Response                     │ CORS                                │
├───────────────────────────────────────┼─────────────────────────────────────┤
│ Flows                                 │ Login                               │
└───────────────────────────────────────┴─────────────────────────────────────┘
myApiproxy(Rev3)$
```

##### proxyEndpoint create <new name>

Create an proxyEndpoint with the name provided, and will open your editor (if you no set, it will ask to you)

```
myApiproxy(Rev3)$ proxyEndpoint create default_test
Enter the basepath:/test/
? Select the Virtual Hosts: default, secure
ProxyEndpoint default_test was created.
myApiproxy(Rev3)$
```

##### proxyEndpoint preflow <name>

Preflow Graph as much as request and response, like the UI in Apigee

```
myApiproxy(Rev3)$ proxyEndpoint preflow default
+------------------------------------------------------------------------------+
|   Request ->                                                                 |
| +-------+                                                                    |
| | Login |                                                                    |
| +-------+                                                                    |
+------------------------------------------------------------------------------+
+------------------------------------------------------------------------------+
|                                                                <- Response   |
|                                                                              |
|                                                                              |
|                                                                              |
+------------------------------------------------------------------------------+
myApiproxy(Rev3)$
```

##### proxyEndpoint postflow <name>

Postflow Graph as much as request and response, like the UI in Apigee

```
myApiproxy(Rev3)$ proxyEndpoint postflow default
+------------------------------------------------------------------------------+
|   Request ->                                                                 |
|                                                                              |
|                                                                              |
|                                                                              |
+------------------------------------------------------------------------------+
+------------------------------------------------------------------------------+
|                                                                <- Response   |
|                                                                     +------+ |
|                                                                     | CORS | |
|                                                                     +------+ |
+------------------------------------------------------------------------------+
myApiproxy(Rev3)$
.....
```

### Command 'targetEndpoint'

##### targetEndpoint <name>

Show you all information about the targetEndpoint

```
myApiproxy(Rev2)$ targetEndpoint default

ApiProxy: myApiproxy
Revision: 3

┌───────────────────────────────────────┬─────────────────────────────────────┐
│ Name                                  │ default                             │
├───────────────────────────────────────┼─────────────────────────────────────┤
│ FaultRules                            │                                     │
├───────────────────────────────────────┼─────────────────────────────────────┤
│ PreFlow Request                       │                                     │
├───────────────────────────────────────┼─────────────────────────────────────┤
│ PreFlow Response                      │                                     │
├───────────────────────────────────────┼─────────────────────────────────────┤
│ PostFlow Request                      │                                     │
├───────────────────────────────────────┼─────────────────────────────────────┤
│ PostFlow Response                     │                                     │
├───────────────────────────────────────┼─────────────────────────────────────┤
│ Flows                                 │                                     │
└───────────────────────────────────────┴─────────────────────────────────────┘
myApiproxy(Rev3)$
```

##### targetEndpoint create <new name>

Create an targetEndpoint with the name provided, and will open your editor (if you no set, it will ask to you)

```
myApiproxy(Rev3)$ targetEndpoint create default_test
? Select type: HTTPTargetConnection
Enter the url:http://test.com/api
TargetEndpoint default_test was created.
myApiproxy(Rev3)$
```

##### targetEndpoint preflow <name>

Preflow Graph as much as request and response, like the UI in Apigee

```
myApiproxy(Rev3)$ targetEndpoint preflow default
+------------------------------------------------------------------------------+
|   Request ->                                                                 |
|                                                                              |
|                                                                              |
|                                                                              |
+------------------------------------------------------------------------------+
+------------------------------------------------------------------------------+
|                                                                <- Response   |
|                                                                              |
|                                                                              |
|                                                                              |
+------------------------------------------------------------------------------+
myApiproxy(Rev3)$
.....
```

##### targetEndpoint postflow <name>

Postflow Graph as much as request and response, like the UI in Apigee

```
myApiproxy(Rev3)$ targetEndpoint postflow default
+------------------------------------------------------------------------------+
|   Request ->                                                                 |
|                                                                              |
|                                                                              |
|                                                                              |
+------------------------------------------------------------------------------+
+------------------------------------------------------------------------------+
|                                                                <- Response   |
|                                                                              |
|                                                                              |
|                                                                              |
+------------------------------------------------------------------------------+
myApiproxy(Rev3)$
```

### Command 'policy'

##### policy <name>

Open a policy in your text editor (if you no set, it will ask to you)

```
myApiproxy(Rev3)$ policy JsonToXml
./3/apiproxy/policies/JsonToXml.xml was opened!
myApiproxy(Rev3)$
```

##### policy create <new name>

Create a new policy, you need to select the policy instance, the policy instance can have a wizard or template (if you no set, it will ask to you)

```
myApiproxy(Rev3)$ policy create AccessControl
? Select your policy:  Access Control
Enter the Display Name:Test
? Select no match rule for ipRules: Allow
? Select type match rule: Deny
Enter the ip match:192.168.1.1
Enter the mask:32
? Select continue: Continue to finish
? Select Validation Based On: For all IP
./3/apiproxy/policies/AccessControl.xml was opened!
myApiproxy(Rev3)$
```

### Command 'resource'

##### resource jsc <name>

Open a jsc's resource in your text editor (if you no set, it will ask to you)

```
myApiproxy(Rev3)$ resource jsc test.js
./3/apiproxy/resources/jsc/test.js was opened!
myApiproxy(Rev3)$
```

##### resource node <name>

Open a node's resource in your text editor (if you no set, it will ask to you)

```
myApiproxy(Rev3)$ resource node index.js
./3/apiproxy/resources/node/index.js was opened!
myApiproxy(Rev3)$

.....
```

### Command 'flow'

##### flow --proxyEndpoint <proxyEndpointName> <name>

Graph as much as request and response, like the UI in Apigee

```
myApiproxy(Rev3)$ flow --proxyEndpoint default begin
+------------------------------------------------------------------------------+
|   Request ->                                                                 |
| +--------+                                                                   |
| | Create |                                                                   |
| +--------+                                                                   |
+------------------------------------------------------------------------------+
+------------------------------------------------------------------------------+
|                                                                <- Response   |
|                                                                  +---------+ |
|                                                                  | Prepare | |
|                                                                  +---------+ |
+------------------------------------------------------------------------------+
myApiproxy(Rev3)$

```

##### flow edit --proxyEndpoint <proxyEndpointName> <name>

Open the flow xml in a separate file, the cli validate policies names and update the `ProxyEndpoint XML`

```
myApiproxy(Rev3)$ flow edit --proxyEndpoint default begin
./.tmpWatcher/proxyEndpoint_default_flow_begin.xml was opened!
myApiproxy(Rev3)$
```


### Command 'settings'

##### settings

List all settings that you can edit with his values

```
myApiproxy(Rev3)$ settings

┌───────────────────────────────────────┬─────────────────────────────────────┐
│ Keys                                  │ Values                              │
├───────────────────────────────────────┼─────────────────────────────────────┤
│ apigee.username                       │ miguelati@gmail.com                 │
├───────────────────────────────────────┼─────────────────────────────────────┤
│ apigee.password                       │ ************                        │
├───────────────────────────────────────┼─────────────────────────────────────┤
│ apigee.organization                   │ org                                 │
├───────────────────────────────────────┼─────────────────────────────────────┤
│ editor                                │ sublime                             │
├───────────────────────────────────────┼─────────────────────────────────────┤
│ graph.withNames                       │ true                                │
├───────────────────────────────────────┼─────────────────────────────────────┤
│ live.validation                       │ true                                │
├───────────────────────────────────────┼─────────────────────────────────────┤
│ live.upload                           │ false                               │
├───────────────────────────────────────┼─────────────────────────────────────┤
│ template                              │                                     │
└───────────────────────────────────────┴─────────────────────────────────────┘
myApiproxy(Rev3)$
```

##### settings save <key>

Edit a key of settings

```
myApiproxy(Rev3)$ settings save live.upload
? You want live upload? Yes
live.upload was changed!
myApiproxy(Rev3)$
```

### Command 'info'

##### info

Information about your enviroment

```
myApiproxy(Rev3)$ info
┌───────────────────────────────────────┬─────────────────────────────────────┐
│ Apigee-edge-cli Version               │ 1.0.7                               │
├───────────────────────────────────────┼─────────────────────────────────────┤
│ Apiproxy name                         │ myApiproxy                          │
├───────────────────────────────────────┼─────────────────────────────────────┤
│ Apiproxy actual revision              │ 3                                   │
├───────────────────────────────────────┼─────────────────────────────────────┤
│ Apiproxies revisions downloads        │ 3,2                                 │
└───────────────────────────────────────┴─────────────────────────────────────┘
myApiproxy(Rev3)$
```

---

Live Validation
===========================

When live.validations (in settings) is true, the cli validate the apiproxy's structure when was edit, add or remove any file

#### Policies

If a policy's name attributes change, he verify that be same that file's name, if it's different the cli rename the actual file with the correct name

#### ProxyEndpoints, TargetEndpoints, Policies & Resources

If you add, edit or remove one of these, the cli do the same if is necessary in `APIProxy XML`

#### Flows

You can edit a flow in a separate file, for a easy view

---

Live Upload
===========================

When `live.upload` is true, every time you edit a Policy or a Resource, the cli upload automatically in `apigee.com`

---

## Notes

This project works with the following software:

* Node.js 8.4
* Git
