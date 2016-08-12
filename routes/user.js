
/*
 * 用户页面
 */
var User = require('../models/user.js');
var Post = require('../models/post.js');

module.exports = function (app) {
	
	app.route('/u/:user')
	.get(function (req, res) {
		User.get(req.params.user, function (err, user) {
			if (!user) {
				req.flash('error', '用户不存在');
				return res.redirect('/');
			}
			Post.get(user.name, function (err, posts) {
				if (err) {
					req.flash('error', err);
					return res.redirect('/');
				}
				res.render('user', {
					title : user.name,
					posts : posts,
					csrfToken : req.csrfToken()
				});
			});
		});
	});
};


