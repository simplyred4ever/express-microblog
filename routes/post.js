/*
 * 发言
 */
const Post = require('../models/post.js');
const routesUtil = require('./routesUtil.js');

module.exports = function(app) {
    app.route('/post').all(routesUtil.checkLogin).post((req, res) => {
        let currentUser = req.session.user;
        let post = new Post(currentUser.name, req.body.post);

        post.save(err => {
            if (err) {
                req.flash('error', err);

                return res.redirect('/');
            }

            req.flash('success', '发表成功');
            res.redirect('/u/' + currentUser.name);
            app.io.sockets.emit('message', {
                msg: 'reload',
                exclude: currentUser.name
            });
        });
    });
    app.route('/post/:id').all(routesUtil.checkLogin).get((req, res) => {
        Post.remove(req.params.id, err => {
            if (err) {
                req.flash('error', err);

                return res.redirect('/');
            }
            res.send({msg: '删除成功！'});
        });
    });

};
