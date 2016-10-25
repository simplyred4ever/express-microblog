const mongodb = require('./db');
const co = require("co");
const settings = require('../../settings');

class User {
    constructor(user) {
        this.name = user.name;
        this.password = user.password;
    }

    static get(username, callback) {
        co(function*() {
            const db = yield mongodb.connect(settings.URL);
            const collection = yield db.collection('users');
            const doc = yield collection.findOne({
                name: username
            });
            let user;
            if (doc) {
                // 封装文档为 User 对象
                user = new User(doc);
            }
            callback(null, user);
            yield db.close();
        }).catch(function(e) {
            console.log(e)
            callback(JSON.stringify(e), null);
        });
    };

    save(callback) {
        // 存入 Mongodb 的文档
        const user = {
            name: this.name,
            password: this.password,
        };
        co(function*() {
            const db = yield mongodb.connect(settings.URL);
            const collection = yield db.collection('users');
            collection.ensureIndex('name', {
                unique: true
            });
            yield collection.insert(user, {
                safe: true
            });
            yield db.close();
            callback(null, user);
            return user;
        }).catch(function(e) {
            console.log(e)
            callback(JSON.stringify(e), null);
        });
    };
}
module.exports = User;
