const format = require("string-template");
const request = require("request");
const fs = require("fs-plus");
const _ = require("lodash")

class ApiProxyRest {

	static url(organization) {
        return `https://api.enterprise.apigee.com/v1/organizations/${organization}`
	}

	static getAuth(username, password) {
		return {
			'user': username,
			'pass': password
		};
	}

	static create(params, auth, callback) {
		let options = {
			method: 'POST',
			uri: ApiProxyRest.url(auth.organization) + "/apis",
			headers: {
				'Content-Type':'application/json'
			},
			auth: ApiProxyRest.getAuth(auth.username, auth.password),
			body: {body:JSON.stringify({name: params.name})}
		};

		request(options, callback);
	}

	static update(params, auth, callback) {
		let options = {
			method: 'POST',
			uri: `${ApiProxyRest.url(auth.organization)}/apis/${params.name}/revisions/${params.revision}`,
			headers: {
				'Content-Type':'multipart/form-data'
			},
			auth: ApiProxyRest.getAuth(auth.username, auth.password),
			form: {
				file: fs.createReadStream(params.file)
			}
		};
		request(options, callback);
	}

	static delete(params, auth, callback) {
		let options = {
			method: 'DELETE',
			uri: format(ApiProxyRest.url(auth.organization) + "/apis/{name}", {name: params.name}),
			auth: ApiProxyRest.getAuth(auth.username, auth.password)
		};
		request(options, callback);
	}
	
	static deleteRevision(params, auth, callback) {
		let options = {
			method: 'DELETE',
			uri: format(ApiProxyRest.url(auth.organization) +"/apis/{name}/revisions/{revision}", {name: params.name, revision: params.revision}),
			auth: ApiProxyRest.getAuth(auth.username, auth.password)
		};
		request(options, callback);
	}

	static deploy(params, auth, callback) {
		let options = {
			method: 'POST',
			uri: format(ApiProxyRest.url(auth.organization) + "/enviroments/{env}/apis/{name}/revisions/{revision}/deployments", {env: params.env, name: params.name, revision: params.revision}),
			headers: {
				'Content-Type':'application/x-www-form-urlencoded'
			},
			auth: ApiProxyRest.getAuth(auth.username, auth.password),
			form: {
				file: fs.createReadStream(params.file)
			}
		};
		request(options, callback);
	}
	
	static export(params, auth, callback) {
		let options = {
            method: 'GET',
            uri: `${ApiProxyRest.url(auth.organization)}/apis/${params.name}/revisions/${params.revision}`,
			auth: ApiProxyRest.getAuth(auth.username, auth.password),
			qs: {
       			format: 'bundle'
    		}
		};

		request(options, callback)
		.on('error', function(error) {
			callback(error);
		})
		.on('finish', function(){
			callback(null);
		}).pipe(fs.createWriteStream(params.path));
	}

	static get(params, auth, callback) {
		let options = {
			method: 'GET',
			auth: ApiProxyRest.getAuth(auth.username, auth.password),
			uri: format(ApiProxyRest.url(auth.organization) + "/apis/{name}", {name: params.name})
		};
		request(options, callback);
	}

	static import(params, auth, callback) {
		let options = {
			method: 'POST',
			uri: ApiProxyRest.url(auth.organization) + "/apis",
			auth: ApiProxyRest.getAuth(auth.username, auth.password),
			qs: {
       			action: 'import',
       			name: params.name
    		},
			headers: {
				'Content-Type':'multipart/form-data'
			},
			form: {
				file: fs.createReadStream(params.file)
			}
		};
		request(options, callback);
	}

	static list(auth, callback) {
		let options = {
			method: 'GET',
			auth: ApiProxyRest.getAuth(auth.username, auth.password),
			uri: format(ApiProxyRest.url(auth.organization) + "/apis")
		};
		request(options, callback);
	}

	static undeploy(params, auth, callback) {
		var options = {
			method: 'DELETE',
			auth: ApiProxyRest.getAuth(auth.username, auth.password),
			uri: format(ApiProxyRest.url(auth.organization) + "/enviroments/{env}/apis/{name}/revisions/{revision}/deployments", {env: params.env, name: params.name, revision: params.revision})
		};
		request(options, callback);
	}
}

module.exports = ApiProxyRest;