/*
 * 用户页面
 */
const User = require('../models/user.js');
const Post = require('../models/post.js');
const moment = require("moment");

module.exports = function(app) {

    app.route('/u/:user').get((req, res) => {
        User.get(req.params.user, (err, user) => {
            if (!user) {
                req.flash('error', '用户不存在');
                return res.redirect('/');
            }
            Post.get(user.name, (err, posts) => {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/');
                }
                for (let post of posts) {
                    post.time = moment(post.time).format("YYYY-MM-DD HH:mm:ss");
                }
                res.render('user', {
                    title: user.name,
                    posts: posts,
                    csrfToken: req.csrfToken()
                });
            });
        });
    });
};
