class Upload {
	static injectCommand(vorpal) {
		vorpal
		.command('upload', 'Upload the APIProxy to apigee.com')
		.action((args, callback) => {
			callback();
		});
	}
}

module.exports = Upload;