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

For the sake of convenience, `cbcluster` includes some sensible defaults
and the defaults (for e.g. bucket creation) which you will find in the
Couchbase Server web console user interface:

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
│ Apigee-edge-cli Version               │ 1.0.2                               │
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
myApiproxy(Rev3)$ apiproxy change
? Select revision:  (Use arrow keys)
❯ 2
  3
myApiproxy(Rev2)$
```


##### apiproxy compare

You can compare between two revisions that was downloaded

```
myApiproxy(Rev3)$ apiproxy compare
```


##### apiproxy proxyEndpoint

List all proxyEndpoints

```
myApiproxy(Rev2)$ apiproxy proxyEndpoint
......
```

##### apiproxy targetEndpoint

List all targetEndpoints

```
myApiproxy(Rev2)$ apiproxy targetEndpoint
......
```

##### apiproxy policies

Lista all policies

```
myApiproxy(Rev2)$ apiproxy policies
.....
```

##### apiproxy resources

Lista all resources

```
myApiproxy(Rev2)$ apiproxy resources
.....
```

### Command 'proxyEndpoint'

##### proxyEndpoint <name>

Show you all information about the proxyEndpoint

```
myApiproxy(Rev2)$ proxyEndpoint default
.....
```

##### proxyEndpoint create <new name>

Create an proxyEndpoint with the name provided, and will open your editor (if you no set, it will ask to you)

```
myApiproxy(Rev2)$ proxyEndpoint create default_test
.....
```

##### proxyEndpoint preflow <name>

Preflow Graph as much as request and response, like the UI in Apigee

```
myApiproxy(Rev2)$ proxyEndpoint preflow default
.....
```

##### proxyEndpoint postflow <name>

Postflow Graph as much as request and response, like the UI in Apigee

```
myApiproxy(Rev2)$ proxyEndpoint postflow default
.....
```

### Command 'targetEndpoint'

##### targetEndpoint <name>

Show you all information about the targetEndpoint

```
myApiproxy(Rev2)$ targetEndpoint default
.....
```

##### targetEndpoint create <new name>

Create an targetEndpoint with the name provided, and will open your editor (if you no set, it will ask to you)

```
myApiproxy(Rev2)$ targetEndpoint create default_test
.....
```

##### targetEndpoint preflow <name>

Preflow Graph as much as request and response, like the UI in Apigee

```
myApiproxy(Rev2)$ targetEndpoint preflow default
.....
```

##### targetEndpoint postflow <name>

Postflow Graph as much as request and response, like the UI in Apigee

```
myApiproxy(Rev2)$ targetEndpoint postflow default
.....
```

### Command 'policy'

##### policy <name>

Open a policy in your text editor (if you no set, it will ask to you)

```
myApiproxy(Rev2)$ policy JsonToXml
.....
```

##### policy create <new name>

Create a new policy, you need to select the policy instance, the policy instance can have a wizard or template (if you no set, it will ask to you)

```
myApiproxy(Rev2)$ policy create AssignMessage
.....
```

### Command 'resource'

##### resource jsc <name>

Open a jsc's resource in your text editor (if you no set, it will ask to you)

```
myApiproxy(Rev2)$ resource jsc test.js
.....
```

##### resource node <name>

Open a node's resource in your text editor (if you no set, it will ask to you)

```
myApiproxy(Rev2)$ resource node index.js
.....
```

### Command 'settings'

##### settings

List all settings that you can edit with his values

```
myApiproxy(Rev2)$ settings
.....
```

##### settings save <key>

Edit a key of settings

```
myApiproxy(Rev2)$ settings save apigee.username
.....
```

### Command 'info'

##### info

Information about your enviroment

```
myApiproxy(Rev2)$ info
.....
```

---

Live Validation
===========================

When live.validations (in settings) is true, the cli validate the apiproxy's structure when was edit, add or remove any file

#### Policies

If a policy's name attributes change, he verify that be same that file's name, if it's different the cli rename the actual file with the correct name

---

Live Upload
===========================


---

## Notes

This project works with the following software:

* Node.js 8.4
* Git
