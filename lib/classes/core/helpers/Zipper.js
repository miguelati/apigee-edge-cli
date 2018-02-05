const AdmZip = require('adm-zip');
const fs = require("fs-plus");
const archiver = require('archiver');

class Zipper {
	static compress(path, fileZip) {
		return new Promise((resolve, reject) => {
			var output = fs.createWriteStream(fileZip);
			var archive = archiver('zip');

			output.on('close', () => resolve());
			archive.on('error', (err) => reject(err));
			archive.pipe(output);
		    archive
			.directory(path, path.match(/([^\/]*)\/*$/)[1])
			.finalize()
		});
	}

	static uncompress(fileZip, path) {
		let zip = new AdmZip(fileZip);
		zip.extractAllTo(path, true);
	}

	static unzipFolders(path, remove = true) {
		let zipFiles = fs.listSync(path, ['zip']);
		for(let index in zipFiles) {
			Zipper.uncompress(zipFiles[index], path);
			if(remove) fs.removeSync(zipFiles[index]);
		}
	}

	static async zipFolders(path, remove = true) {
		let listFiles = fs.listSync(path);
		for(let index in listFiles) {
			if(fs.isDirectorySync(listFiles[index])) {
				await Zipper.compress(`./${listFiles[index]}/`,`${path}${listFiles[index].match(/([^\/]*)\/*$/)[1]}.zip`);
				if(remove) fs.removeSync(listFiles[index]);
			}
		}
	}
}

module.exports = Zipper;