
/*
 * GET home page.
 */
var crypto = require('crypto');
var User = require('../models/user.js');
var routesUtil = require('./routesUtil.js');

module.exports = function (app) {

	// 登入
	app.route('/login')
	.all(routesUtil.checkNotLogin)
	.get(function (req, res) {
		res.render('login', {
			title : '用户登入',
			csrfToken : req.csrfToken()
		});
	})
	.post(function (req, res) {
		//生成口令的散列值
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('base64');

		User.get(req.body.username, function (err, user) {
			if (!user) {
				req.flash('error', '用户不存在');
				return res.redirect('/login');
			}
			if (user.password != password) {
				req.flash('error', '用户口令错误');
				return res.redirect('/login');
			}
			req.session.user = user;
			req.flash('success', '登入成功');
			res.redirect('/');
		});
	});
};
