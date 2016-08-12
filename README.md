重写nodejs开发指南－微博系统 express.js mongodb。

model层开始使用es6代码风格：

 	var mongodb = require('./db');
	var co = require("co");
	var util = require('util');

	class Post {
		constructor(username, post, time) {
			this.user = username;
			this.post = post;
			if (time) {
				this.time = time;
			} else {
				this.time = new Date();
			}
		};
		
		static get (username, callback) {
			co(function* () {		
				var db = yield mongodb.connect('mongodb://localhost/microblog');
				var collection = yield db.collection('posts');
				var query = {};
				if (username) {
					query.user = username;
				}
				var docs = yield collection.find(query).sort({
					time : -1
				}).toArray();

				// 封装 posts 为 Post 对象
				var posts = [];
				docs.forEach(function (doc, index) {
					var post = new Post(doc.user, doc.post, doc.time);
					posts.push(post);
				});

				yield db.close();
				callback(null, posts);
			}).catch(function (e) {
				console.log(e)
				callback(JSON.stringify(e), null);
			});
		}
		
		save (callback) {
			var post = {
				user : this.user,
				post : this.post,
				time : this.time,
			};
			
			co(function* () {		
				var db = yield mongodb.connect('mongodb://localhost/microblog');
				var collection = yield db.collection('posts');
				collection.ensureIndex('user');
				yield collection.insert(post, {
						safe : true
					});
				yield db.close();
				callback(null, post);
				return post;
			}).catch(function (e) {
				console.log(e)
				callback(JSON.stringify(e), null);
			});
		}

	}
	module.exports = Post;
