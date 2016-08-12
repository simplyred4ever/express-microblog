var mMongoClient = require('mongodb').MongoClient;
var tMongoClient = require('thunkify-mongodb').MongoClient;
module.exports = new tMongoClient(new mMongoClient());
