
/**
 * Module dependencies.
 */
var express = require('express'); // 引用express框架
var partials = require('express-partials'); // Express3.0中引用layout.ejs时
var routes = require('./routes'); // 路由控制，找routes.js或routes/index.js
var http = require('http');
var path = require('path'); // 路径模块
var favicon = require('serve-favicon');
var app = express(); // 使用框架
var session = require('express-session');
var MongoStore = require('connect-mongo')(session); // 连mongo数据库*/
var settings = require('./settings'); // 引用settings.js*/
var flash = require('connect-flash'); // 使用页面闪存
var mongodb = require('./models/db');
var morgan = require('morgan'); //logger模块的这个新名字真是神奇
var compression = require('compression'); //压缩中间件，deflate、gzip等格式
var methodOverride = require('method-override'); //重载方法
var cookieParser = require('cookie-parser');
var csrf = require('csurf');
var errorHandler = require('errorHandler');
var bodyParser = require('body-parser');
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views'); // 模板位置 MVC的V
app.set('view engine', 'ejs'); // 模板引擎
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(morgan('dev'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
		extended : false
	})); // for parsing application/x-www-form-urlencoded
app.use(cookieParser()); // Cookie解析中间件
app.use(csrf({
		cookie : true
	}));
app.use(methodOverride('_method')); // override with POST having ?_method=DELETE
// error handler
app.use(function (err, req, res, next) {
	if (err.code !== 'EBADCSRFTOKEN')
		return next(err);
	// handle CSRF token errors here
	res.status(403);
	res.send('form tampered with');
})
app.use(partials()); // Express3.0中引用layout.ejs时
app.use(flash()); // 闪存工具，通过它保存的变量只会在用户当前和下一次的请求中被访问，之后会被清除*/
app.use(session({
		resave : false, //添加这行
		saveUninitialized : true, //添加这行
		secret : settings.COOKIE_SECRET,
		key : settings.db, //cookie name
		cookie : {
			maxAge : 1000 * 60 * 60 * 24 * 30
		}, //30 days
		store : new MongoStore({
			username : settings.USERNAME,
			password : settings.PASSWORD,
			url : settings.URL,
			db : settings.DB
		})
	}));

app.use(function (req, res, next) {
	res.locals.user = req.session.user;
	res.locals.post = req.session.post;
	var error = req.flash('error');
	res.locals.error = error.length ? error : null;

	var success = req.flash('success');
	res.locals.success = success.length ? success : null;
	res.locals._csrf = req.session._csrf; // 防止csrf攻击
	next();
});
app.use(compression({level: 9})); // 压缩中间件 level压缩程度最高
app.use(express.static(path.join(__dirname, 'public'))); //设置静态文件目录
routes(app); // 路由控制MVC的C

app.on('close', function () {
	mongodb.close();
});

app.use(errorHandler({ // 错误处理
		dumpExceptions : true,
		showStack : true
	}));

module.exports = app;
