var common = require('./common');
var validation = common.validation;
var assert = common.chai.assert;
var moment = require('../../source/momment');

it('should return the value when the value is not empty', function() {
	var options = {
        "required":true,
        "name":"contractId",
        "type":"string",
        "value":"Miguel",
        "default": "Hola"
    };
	var result = validation.checkDefault(options);
  	assert.equal(options.value, result);
});

