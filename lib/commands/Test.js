const ApiProxyHelper = require('../classes/core/helpers/APIProxy');

class Test {
	static injectCommand(vorpal) {
		vorpal
		.command('test', 'My Test')
		.action((args, callback) => {
			var dircompare = require('dir-compare');
			var options = {compareSize: true};
			var path1 = './apiproxy';
			var path2 = '../TigoID_Query/apiproxy';
			var res = dircompare.compareSync(path1, path2, options);
			console.log('equal: ' + res.equal);
			console.log('distinct: ' + res.distinct);
			console.log('left: ' + res.left);
			console.log('right: ' + res.right);
			console.log('differences: ' + res.differences);
			console.log('same: ' + res.same);
			var format = require('util').format;
			res.diffSet.forEach(function (entry) {
			    var state = {
			        'equal' : '==',
			        'left' : '->',
			        'right' : '<-',
			        'distinct' : '<>'
			    }[entry.state];
			    var name1 = entry.name1 ? entry.name1 : '';
			    var name2 = entry.name2 ? entry.name2 : '';

			    if(state !== '==') {
			    	console.log(format('%s(%s)%s%s(%s)', name1, entry.type1, state, name2, entry.type2));
			    }
			});
			callback();
		});
	}
}

module.exports = Test;