const {MongoClient: m} = require('mongodb');
const {MongoClient: t} = require('thunkify-mongodb');
module.exports = new t(new m());
