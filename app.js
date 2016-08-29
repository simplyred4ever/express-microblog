/**
 * Module dependencies.
 */
const express = require('express'); // 引用express框架
const partials = require('express-partials'); // Express3.0中引用layout.ejs时
let routes = require('./routes'); // 路由控制，找routes.js或routes/index.js
const path = require('path'); // 路径模块
const favicon = require('serve-favicon');
let app = express(); // 使用框架
let http = require('http').Server(app);
let io = require('socket.io')(http);
const session = require('express-session');
let MongoStore = require('connect-mongo')(session); // 连mongo数据库*/
const settings = require('./settings'); // 引用settings.js*/
const flash = require('connect-flash'); // 使用页面闪存
const mongodb = require('./models/db');
const morgan = require('morgan'); //logger模块的这个新名字真是神奇
const compression = require('compression'); //压缩中间件，deflate、gzip等格式
const methodOverride = require('method-override'); //重载方法
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const errorHandler = require('errorHandler');
const bodyParser = require('body-parser');

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views'); // 模板位置 MVC的V
app.set('view engine', 'ejs'); // 模板引擎
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(morgan('dev'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
    extended: false
})); // for parsing application/x-www-form-urlencoded
app.use(cookieParser()); // Cookie解析中间件
app.use(csrf({
    cookie: true
}));
app.use(methodOverride('_method')); // override with POST having ?_method=DELETE
// error handler
app.use((err, req, res, next) => {
    if (err.code !== 'EBADCSRFTOKEN') {
        return next(err);
    }

    // handle CSRF token errors here
    res.status(403);
    res.send('form tampered with');
});
app.use(partials()); // Express3.0中引用layout.ejs时
app.use(flash()); // 闪存工具，通过它保存的变量只会在用户当前和下一次的请求中被访问，之后会被清除*/
app.use(session({
    resave: false, //添加这行
    saveUninitialized: true, //添加这行
    secret: settings.COOKIE_SECRET,
    key: settings.DB, //cookie name
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30
    }, //30 days
    store: new MongoStore({
        username: settings.USERNAME,
        password: settings.PASSWORD,
        url: settings.URL,
        db: settings.DB
    })
}));
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.post = req.session.post;

    let error = req.flash('error');

    res.locals.error = error.length ? error : null;

    let success = req.flash('success');

    res.locals.success = success.length ? success : null;
    res.locals._csrf = req.session._csrf; // 防止csrf攻击
    next();
});
app.use(compression({
    level: 9
})); // 压缩中间件 level压缩程度最高
app.use(express.static(path.join(__dirname, 'public'))); //设置静态文件目录
app.io = io;
routes(app); // 路由控制MVC的C
app.on('close', () => {
    mongodb.close();
});
app.use(errorHandler({
    // 错误处理
    dumpExceptions: true,
    showStack: true
}));
io.on('connection', socket => {
    console.log("Connection " + socket.id + " accepted.");
    socket.on('disconnect', () => {
        console.log("Connection " + socket.id + " terminated.");
    });
});
module.exports = app;
module.exports.http = http;
