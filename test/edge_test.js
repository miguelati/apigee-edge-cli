var importTest = function(name, path) {
	describe(name, function() {
		require(path);
	});
};

var common = require('./validation/common');

describe('EDGE', => {
	describe('XML Classes', => {
		importTest('#Class ApiProxy', './lib/classes/xml/api_proxy_test');
	});
});