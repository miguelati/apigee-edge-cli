var fs = require("fs");
var path = require("path");

module.exports = {
	getCurrentPath : function() {
		return process.cwd();
	},
	getCurrentDirectoryBase : function() {
		return path.basename(process.cwd());
	},
	directoryExists : function(filePath) {
		try {
			return fs.statSync(filePath).isDirectory();
		} catch (error) {
			return false;
		}
	}
};