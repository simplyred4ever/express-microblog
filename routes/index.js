/*
 * GET home page.
 */
var Post = require('../models/post.js');
var markdown = require('markdown').markdown;

module.exports = function(app) {
    var routes = ['./reg', './login', './logout', './post', './user', './file'];

    for (var i in routes) {
        require(routes[i])(app);
    }
    // 首页
    app.get('/', function(req, res) {
        Post.get(null, function(err, posts) {
            if (err) {
                posts = [];
            }

            var markdownPosts = [];
            for (var post of posts) {
              if (!post.post.match(/(\$\$.*\$\$)/)) {
                console.log(post.post);
                post.post = post.post.replace(/\\\(/g, '\\\\(').replace(/\\\)/g, '\\\\)');
                post.post = markdown.toHTML(post.post);
                console.log(post.post);
              }
              markdownPosts.push(post);
            }
            res.render('index', {
                title: '首页',
                csrfToken: req.csrfToken(),
                posts: markdownPosts
            });
        });
    });
};
