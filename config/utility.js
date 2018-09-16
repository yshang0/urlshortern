'use strict' //The purpose of "use strict" is to indicate that the code should be executed in "strict mode"

var cryptoHash = require('crypto'); //# add crypto
var bases = require('bases');

module.exports = {
	validateCustomizeBodyURL: function (body) {
		console.log("Customize URl Body", body);
		if(!body.hasOwnProperty('customizedshorturl'))
			return 'Customized short URL not found!';
		else if(!body.hasOwnProperty('longURl')) //check if longURL is the one of property of body;
			return 'LongURL not found!'
		return 'succeed';
	},

	validateLongURL: function (body) {
		console.log("Long URL Body", body);
		if(!body.hasOwnProperty('longURL'))
			return 'longURL not found!';
		return 'succeed';
	},

	hash: function(url, salt) {

		var md5 = cryptoHash.createHash('md5');
		//MD5 is one type od hash, used to sign on a random data.
		md5.update(url);
		md5.update(salt);
		var hash = md5.digest('hex');// digest is a method of crypto, input the abstract of data, 'hex' is the method of coding;
	
		var shortURLGnrt = bases.toBase62(parseInt(hash, 16));
		shortURLGnrt = shortURLGnrt.substring(0, 6);
		return shortURLGnrt;

	}
};

