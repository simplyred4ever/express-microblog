
/*
 * 发言
 */
var Post = require('../models/post.js');
var routesUtil = require('./routesUtil.js');

module.exports = function (app) {
	
	app.route('/post')
	.all(routesUtil.checkLogin)
	.post(function (req, res) {
		var currentUser = req.session.user;
		var post = new Post(currentUser.name, req.body.post);
		post.save(function (err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			req.flash('success', '发表成功');
			res.redirect('/u/' + currentUser.name);
		});
	});
};


