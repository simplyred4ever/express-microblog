
/*
 * GET home page.
 */
var Post = require('../models/post.js');
module.exports = function (app) {

    var routes = ['./reg', './login', './logout', './post', './user', './file'];
    for (var i in routes) {
        require(routes[i])(app);
    }

    // 首页
    app.get('/', function (req, res) {
        Post.get(null, function (err, posts) {
            if (err) {
                posts = [];
            }
            res.render('index', {
                title : '首页',
				csrfToken : req.csrfToken(),
                posts : posts
            });
        });
    });
};
