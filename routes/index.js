/*
 * GET home page.
 */
var Post = require('../models/post.js');
var markdown = require('markdown').markdown;
var moment = require("moment");

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
                post.time = moment(post.time).format("YYYY-MM-DD HH:mm:ss");
                if (!post.post.match(/(\$\$.*\$\$)/)) {
                    // 对公式不转码，由页面mathjax
                    if (post.post.match(/^(sequenceDiagram|gantt|graph)/)) {
                        post.post = '<div class="mermaid">' + post.post + '</div>';
                    } else {
                        post.post = markdown.toHTML(post.post);
                    }
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
