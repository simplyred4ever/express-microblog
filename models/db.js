var settings = require('../settings');
/*Db = require('mongodb').Db,
Server = require('mongodb').Server;*/
/*module.exports = new Db(settings.DB, new Server(settings.HOST, settings.PORT, {
			auto_reconnect : true,
			native_parser : true
		}), {
		safe : true
	});*/
var mMongoClient = require('mongodb').MongoClient;
var tMongoClient = require('thunkify-mongodb').MongoClient;
module.exports = new tMongoClient(new mMongoClient());
