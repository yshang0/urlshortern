'use strict';

var express = require('express');
var bodyParser = require('body-parser');
const { Pool, Client } = require('pg');
var validUrl = require('valid-url');

var utility = require('./config/utility');
var app = express();

var base_url = process.env.BASE_URL || 'http://localhost:8080';//we have set baseUrl, if BASE_URL has existed, baseUrl = BASE_URL, otherwise baseUrl = http://localhost:3000。
// goo.gl/4kf8sd

var connectionString = "postgres://jzqgphkceqqufn:48c6c5da579f37831c16a9bb4bf54416b73bb029d382deac3827b23867d34c0b@ec2-54-83-27-165.compute-1.amazonaws.com:5432/d5hnm16u18v62c"

const client = new Client({
  connectionString: connectionString,
  ssl: true
});

client.connect(function(err) {
	if(err)
	{
	    console.log("Connected to postgres ERR!");//print out Connected to postgres!
		throw err;
	}
	else
		console.log("Connected to postgres!");//print out Connected to postgres!
});

var router = express.Router();

app.use(bodyParser.urlencoded({ extended: true})); // Content-Type: application/x-www-form-urlencoded
app.use(bodyParser.json());
app.set('json spaces', 2);
app.set('json replacer', null);

app.set('port', (process.env.PORT || 8080));

app.use(express.static(__dirname + '/views'));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

//CORS middleware

var allowCrossDomain = function(request, response, next) {
	response.header('Access-Control-Allow-Origin', '*');
	response.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	//get:retrieve information; 
	//put:Store an entity at a URI.PUT can create a new entity or update an existing one. 
	//delete:Request that a resource be removed;
	//Post:Request that the resource at the URI do something with the provided entity.
	//options:
	response.header('Access-Control-Allow-Methods', 'Content-Type');
	//intercept OPTIONS method for preflight request from chrome
	if('OPTIONS' === request.method) return response.sendStatus(200);
	else next();
};
router.use(allowCrossDomain);

// display the index.html
router.get('/', function(request, response) {
	response.render('index');
});

router.get('/:shortURLId', function(request, response) {
	var shortURLId = request.params.shortURLId.trim();
	client.query('SELECT longurl FROM shorturlmap WHERE shorturl = $1',[shortURLId], function(err, result) {
		//$1 refer to first argument;
		if(err) {
			console.log(err);
			return response.status(500).json({'err': 'PostgreSQL SELECT ERR!'});

		}
		if(result.rows.length == 0) {
			return response.render('error'); // 404 pages
		}

		var selectedLongURL = result.rows[0];
		console.log("selectedLongURL: " + selectedLongURL);
		console.log(selectedLongURL['longurl'].trim() + "ending");
		return response.redirect(301, selectedLongURL['longurl'].trim());
	});

});

//shortening: take a url => shorter url
router.post('/longurl', function(request, response) {

	var body = request.body;
	console.log(body);
	var isValid = utility.validateLongURL(body);
	console.log(body.longURL);
	if(isValid != 'succeed') {
		return response.status(400).json({'err': 'Bad Request', 'message': isValid});
	}

	var longURLParams = body.longURL.trim();
	if(!validUrl.isUri(longURLParams)) {
		return response.json({'err': 'Invalid URL!'});

	}

	var shortURLGnrt = utility.hash(longURLParams, new Date().toISOString());
	console.log(shortURLGnrt);
	client.query('INSERT INTO shorturlmap(shortUrl, longUrl, userId, count) VALUES($1, $2, $3, $4)', [shortURLGnrt, longURLParams, 0, 0], function(err, result){
		if(err) {
			console.log(err);
			return response.status(500).json({'err': 'PostgreSQL INSERT ERR!'});
		}

//		console.log(longURLParams);
		var shortedURL = base_url +'/' + shortURLGnrt;
		return response.json({'message': 'Short URL Generated!', 'ShortURL': shortedURL});
	});
});

//Redirecting: short url => original url
//custom url
router.post('/custom', function(request, response) {
	var body = request.body;
	var isValid = utility.validateCustomizeBodyURL(body);
	if(isValide != 'succeed') {
		return response.status(400).json({'err': 'Bad Request', 'message': isValid});
	}

	var shortURL = body.customizedshorturl;
	var longURL = body.longURL.trim();
	var userId = body.userId;
	if(!validUrl.isUri(longURL)) {
		return response.json({'err': 'Invalid URL!'});
	}

	client.query('SELECT longUrl FROM shorturlmap WHERE shortUrl = $1', [shortURL], function(err, result) {
		if(err) {
			console.log(err);
			return response.status(500).json({'err': 'PostgreSQL SELECT ERR!'});
		}

		var found = result.rows.length;
		console.log(found);
		if(found > 0) {
			return response.json({'err': 'The short URL has been used!'});
		}

		client.query('INSERT INTO shorturlmap(shortUrl, longUrl, userId, count) VALUES($1, $2, $3, $4)', [shortURL, longURL, userId, 0], function(err, result){
			if(err) {
				console.log(err);
				return response.status(500).json({'err': 'PostgreSQL INSERT ERR!'});
			}

			var shortedURL = base_url + '/' + shortURL;
			return response.json({'message': 'CustomizedURL Generated!', 'ShortURL': shortedURL});
		});
	});
});

app.use(router);

var server = app.listen(app.get('port'), function() {

	var host = server.address().address;
	var port = server.address().port;

	console.log('URL Shortener is running on http://%s:%s', host, port)
});



