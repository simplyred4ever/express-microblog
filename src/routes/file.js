const fs = require('fs');
const thunkify = require('thunkify');
const co = require('co');
const readFile = thunkify(fs.readFile);
const util = require('util');
const multer = require('multer');

//var multiparty = require('multiparty');

module.exports = function(app) {

    app.route('/file').get((req, res) => {

            co(function*() {
                let r1,
                    r2;
                r1 = yield readFile('public/stylesheets/bootstrap.min.css');
                r2 = yield readFile('public/stylesheets/bootstrap-theme.min.css');
                res.render('file', {
                    title: '文件读取示例',
                    data: r1.toString() + '\n\n\n' + r2.toString(),
                    csrfToken: req.csrfToken()
                });
            });
        })
        /*.post(function (req, res) {
        //生成multiparty对象，并配置上传目标路径
        var form = new multiparty.Form({
        uploadDir : './public/upload/',
        maxFieldsSize : 100 * 1024 * 1024
        });
        form.on('error', function (err) {
        console.log('Error parsing form: ' + err.stack);
        });
        //上传完成后处理
        form.parse(req, function (err, fields, files) {
        var filesTmp = JSON.stringify(files, null, 2);
        //var data = util.inspect({
        //		fields : fields,
        //		files : filesTmp
        //	});
        var dstPaths = [];
        if (err) {
        console.log('parse error: ' + err);
        return;
        }
        for (let inputFile of files.inputFile) {
        var uploadedPath = inputFile.path;
        var dstPath = './public/upload/' + inputFile.originalFilename;
        dstPaths.push(dstPath);
        console.log(dstPath);
        //重命名为真实文件名
        fs.rename(uploadedPath, dstPath, function (err) {
        if (err) {
        console.log('rename error: ' + err);
        } else {
        console.log('rename ok');
        }
        });
        }
        dstPaths = dstPaths.join('<br />');

        res.send(`<script>parent.callback("${dstPaths}");</script>`);

        });
        });*/

    .post((req, res) => {
        multer({
            storage: multer.diskStorage({
                //设置上传后文件路径，uploads文件夹会自动创建。
                destination: function(req, file, cb) {
                    cb(null, './public/uploads')
                },
                //给上传文件重命名，获取添加后缀名
                filename: function(req, file, cb) {
                    cb(null, file.fieldname + '-' + Date.now() + "-" + file.originalname);
                }
            }),
            limits: {
                fieldNameSize: 200,
                fieldSize: 10 * 1024 * 1024
            }
        }).array('inputFile', 100)(req, res, err => {
            //添加错误处理
            if (err) {
                return console.log(err);
            }
            //文件信息在req.file或者req.files中显示。
            //console.log(90);
            var dstPath = [];
            for (let inputFile of req.files) {
                dstPath.push('./public/uploads/' + inputFile.originalname);
            }
            dstPath = dstPath.join('<br />');
            res.send(`<script>parent.callback("${dstPath}");</script>`);
        });
    });
};
