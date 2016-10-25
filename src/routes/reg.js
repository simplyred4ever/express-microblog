/*
 * GET home page.
 */
const crypto = require('crypto'); //功能是加密并生成各种散列
const User = require('../models/user.js');
const routesUtil = require('./routesUtil.js');

module.exports = function(app) {

    // 注册
    app.route('/reg').all(routesUtil.checkNotLogin).get((req, res) => {
        res.render('reg', {
            title: '用户注册',
            csrfToken: req.csrfToken()
        });
    }).post((req, res) => {
        //检验用户两次输入的口令是否一致
        if (req.body['password-repeat'] != req.body.password) {
            req.flash('error', '两次输入的口令不一致');
            return res.redirect('/reg');
        }

        //生成口令的散列值
        const md5 = crypto.createHash('md5');
        const password = md5.update(req.body.password).digest('base64');

        const newUser = new User({
            name: req.body.username,
            password: password
        });

        //检查用户名是否已经存在
        User.get(newUser.name, (err, user) => {
            if (user) {
                err = '用户已存在';
            }
            if (err) {
                req.flash('error', err);
                return res.redirect('/reg');
            }
            //如果不存在则新增用户
            newUser.save(err => {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/reg');
                }
                req.session.user = newUser;
                req.flash('success', '注册成功');
                res.redirect('/');
            });

        });
    });

};
