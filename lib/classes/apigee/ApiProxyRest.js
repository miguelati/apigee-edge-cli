const rqNative = require("request-promise-native");
const rq = rqNative.defaults({ simple: false });
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

	static npm(params, auth) {

		//https://api.enterprise.apigee.com/v1/organizations/{org_name}/apis/{api_name}/revisions/{revision_num}/npm
		let options = {
			method: 'POST',
			headers: {
				'content-type':'application/x-www-form-urlencoded'
			},
			uri: `${ApiProxyRest.url(auth.organization)}/apis/${params.name}/revisions/${params.revision}/npm`,
			auth: ApiProxyRest.getAuth(auth.username, auth.password),
			body: `command=${params.command}&production=false`
			//transform: (body) => JSON.parse(body)
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

	static getDeployments(params, auth) {
		let options = {
			method: 'GET',
            auth: ApiProxyRest.getAuth(auth.username, auth.password),
			uri: `${ApiProxyRest.url(auth.organization)}/apis/${params.name}/deployments`,
			transform: (body) => JSON.parse(body)
		};
		return rq(options);
	}

	static setDeploy(params, auth) {
		let options = {
			method: 'POST',
			qs: {
				override: false
			},
			headers: {
				'content-type':'application/x-www-form-urlencoded'
			},
            auth: ApiProxyRest.getAuth(auth.username, auth.password),
			uri: `${ApiProxyRest.url(auth.organization)}/environments/${params.environment}/apis/${params.name}/revisions/${params.revision}/deployments`,
			transform: (body) => JSON.parse(body)
		};
		return rq(options)
					    .then(function (response) {
					        return response;
					    });
	}

	static setUndeploy(params, auth) {
		let options = {
			method: 'DELETE',
            auth: ApiProxyRest.getAuth(auth.username, auth.password),
			uri: `${ApiProxyRest.url(auth.organization)}/environments/${params.environment}/apis/${params.name}/revisions/${params.revision}/deployments`,
			transform: (body) => JSON.parse(body)
		};
		return rq(options)
					    .then(function (response) {
					        return response;
					    });
				
	}

	static getVirtualHosts(params, auth) {
		let options = {
			method: 'GET',
            auth: ApiProxyRest.getAuth(auth.username, auth.password),
			uri: `${ApiProxyRest.url(auth.organization)}/environments/${params.env}/virtualhosts`,
		};
		return rq(options);
	}
	
	static export(params, auth) {
		let options = {
            method: 'GET',
            encoding: null,
            uri: `${ApiProxyRest.url(auth.organization)}/apis/${params.name}/revisions/${params.revision}`,
			auth: ApiProxyRest.getAuth(auth.username, auth.password),
			qs: {
       			format: 'bundle'
    		}
		};

		return rq(options);
		/*.on('error', function(error) {
			callback(error);
		})
		.on('finish', function(){
			callback(null);
		}).pipe(fs.createWriteStream(params.path));*/
	}

	static createPolicy(params, auth) {
		let options = {
			method: 'POST',
			uri: `${ApiProxyRest.url(auth.organization)}/apis/${params.name}/revisions/${params.revision}/policies`,
			headers: {
				'content-type': 'application/xml',
				'accept': 'application/xml'
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
				'Content-Type': 'application/octet-stream'
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