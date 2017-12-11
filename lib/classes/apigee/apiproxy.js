var format = require("string-template");
var orgainzation = "millicom-nonprod";
var urlBase = format("https://api.enterprise.apigee.com/v1/organizations/{organization}", {organization: orgainzation});
var request = require("request");

class ApiProxyRest {

	static create(name) {
		var options = {
			method: 'POST',
			uri: urlBase + "/apis",
			headers: {
				'Content-Type':'application/json'
			},
			body: {body:JSON.stringify({name: name})}
		};
		return rp(options);
	}
	update(name, revision, file) {
		var url = format(urlBase + + "/apis/{name}/revisions/{revision}", {name: name, revisionNumber: revision})

		var options = {
			method: 'POST',
			uri: url,
			headers: {
				'Content-Type':'multipart/form-data'
			},
			form: {
				file: fs.createReadStream(file)
			}
		};
		return rp(options);
	}
	delete(name) {
		var url = format(urlBase + + "/apis/{name}", {name: name})
		var options = {
			method: 'DELETE',
			uri: url
		};
		return rp(options);
	}
	deleteRevision(name, revision) {
		var url = format(urlBase + + "/apis/{name}/revisions/{revision}", {name: name, revision: revision})		
		var options = {
			method: 'DELETE',
			uri: url
		};
		return rp(options);
	}
	deploy(env, name, revision, options) {
		var url = format(urlBase + "/enviroments/{env}/apis/{name}/revisions/{revision}/deployments", {name: name, revision: revision});
		var options = {
			method: 'POST',
			uri: url,
			headers: {
				'Content-Type':'application/x-www-form-urlencoded'
			},
			form: {
				file: fs.createReadStream(file)
			}
		};
		return rp(options);
	}
	export(name, revision) {
		var url = format(urlBase + "/apis/{name}/revisions/{revision}", {name: name, revision: revision});
		var options = {
			method: 'GET',
			uri: url,
			qs: {
       			format: 'bundle'
    		}
		};
		return rp(options);
	}
	get(name) {
		var url = format(urlBase + "/apis/{name}", {name: name});
		var options = {
			method: 'GET',
			uri: url
		};
		return rp(options);
	}
	import(name, file) {
		var options = {
			method: 'POST',
			uri: urlBase + "/apis",
			qs: {
       			action: 'import',
       			name: name
    		},
			headers: {
				'Content-Type':'multipart/form-data'
			},
			form: {
				file: fs.createReadStream(file)
			}
		};
		return rp(options);
	}
	list(){
		var url = format(urlBase + "/apis");
		var options = {
			method: 'GET',
			uri: url
		};
		return rp(options);
	}
	undeploy(env, name, revision) {
		var url = format(urlBase + "/enviroments/{env}/apis/{name}/revisions/{revision}/deployments", {name: name, revision: revision});
		var options = {
			method: 'DELETE',
			uri: url
		};
		return rp(options);
	}
}

module.exports = ApiProxyRest;