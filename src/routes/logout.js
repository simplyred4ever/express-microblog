/*
 * 登出
 */
const routesUtil = require('./routesUtil.js');

module.exports = function(app) {

    app.route('/logout').all(routesUtil.checkLogin).get((req, res) => {
        req.session.user = null; // 清除
        req.flash('success', '登出成功');
        res.redirect('/');
    });

};
