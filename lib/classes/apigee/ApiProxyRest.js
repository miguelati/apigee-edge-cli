const request = require("request");
const rq = require("request-promise-native");
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

	static update(params, auth) {
		let options = {
			method: 'POST',
			uri: `${ApiProxyRest.url(auth.organization)}/apis/${params.name}/revisions/${params.revision}`,
			qs: {
				validate: false
			},
			auth: ApiProxyRest.getAuth(auth.username, auth.password),
			formData: {
				file: {
					value: fs.createReadStream(`./${params.file}`),
					options: {
						filename: params.file,
						contentType: 'application/zip'
					}
				}
			},
			transform: (body) => JSON.parse(body)
		};
		return rq(options);
	}

	static import(params, auth) {
		let options = {
			method: 'POST',
			uri: `${ApiProxyRest.url(auth.organization)}/apis`,
			qs: {
				action: params.action,
				name: params.name,
				validate: false
			},
			auth: ApiProxyRest.getAuth(auth.username, auth.password),
			formData: {
				file: {
					value: fs.createReadStream(`./${params.file}`),
					options: {
						filename: params.file,
						contentType: 'application/zip'
					}
				}
			},
			transform: (body) => JSON.parse(body)
		};
		return rq(options);
	}
	
	static getRevisions(params, auth) {
		let options = {
			method: 'GET',
            auth: ApiProxyRest.getAuth(auth.username, auth.password),
			uri: `${ApiProxyRest.url(auth.organization)}/apis/${params.apiproxyName}/revisions`,
			transform: (body) => JSON.parse(body)
		};
		return rq(options);
	}

	static getVirtualHosts(params, auth, callback) {
		let options = {
			method: 'GET',
            auth: ApiProxyRest.getAuth(auth.username, auth.password),
			uri: `${ApiProxyRest.url(auth.organization)}/environments/${params.env}/virtualhosts`,
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

	static createPolicy(params, auth) {
		let options = {
			method: 'POST',
			uri: `${ApiProxyRest.url(auth.organization)}/apis/${params.name}/revisions/${params.revision}/policies`,
			headers: {
				'content-type': 'application/xml',
				'accept': 'application/json'
			},
			auth: ApiProxyRest.getAuth(auth.username, auth.password),
			body: params.body
		};
		return rq(options);
	}

	static updatePolicy(params, auth) {
		let options = {
			method: 'PUT',
			uri: `${ApiProxyRest.url(auth.organization)}/apis/${params.name}/revisions/${params.revision}/policies/${params.policyName}`,
			headers: {
				'content-type': 'application/xml'
			},
			auth: ApiProxyRest.getAuth(auth.username, auth.password),
			body: params.body
		};
		return rq(options);
	}

	static deletePolicy(params, auth) {
		let options = {
			method: 'DELETE',
			uri: `${ApiProxyRest.url(auth.organization)}/apis/${params.name}/revisions/${params.revision}/policies/${params.policyName}`,
			headers: {
				'content-type': 'application/xml'
			},
			auth: ApiProxyRest.getAuth(auth.username, auth.password)
		};
		return rq(options);
	}

	static createResource(params, auth) {
		let options = {
			method: 'POST',
			uri: `${ApiProxyRest.url(auth.organization)}/apis/${params.name}/revisions/${params.revision}/resourcefiles`,
			qs: {
				name: encodeURIComponent(params.resourceName),
				type: params.resourceType
			},
			headers: {
				'content-type': 'application/octet-stream'
			},
			auth: ApiProxyRest.getAuth(auth.username, auth.password),
			body: params.body
		};
		return rq(options);
	}

	static updateResource(params, auth) {
		let options = {
			method: 'PUT',
			uri: `${ApiProxyRest.url(auth.organization)}/apis/${params.name}/revisions/${params.revision}/resources/${params.resourceType}/${encodeURIComponent(params.resourceName)}`,
			headers: {
				'content-type': 'application/octet-stream'
			},
			auth: ApiProxyRest.getAuth(auth.username, auth.password),
			body: params.body
		};
		return rq(options);
	}

	static deleteResource(params, auth) {
		let options = {
			method: 'DELETE',
			uri: `${ApiProxyRest.url(auth.organization)}/apis/${params.name}/revisions/${params.revision}/resourcefiles/${params.resourceType}/${encodeURIComponent(params.resourceName)}`,
			auth: ApiProxyRest.getAuth(auth.username, auth.password)
		};
		return rq(options);
	}

}

module.exports = ApiProxyRest;