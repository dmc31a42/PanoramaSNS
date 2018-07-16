module.exports = function(){
    var express = require('express');
    var session = require('express-session');
    var MySQLStore = require('express-mysql-session')(session);
    var bodyParser = require('body-parser');

    var fs = require('fs');
    var contents = fs.readFileSync('./config/mysql/config.json');
    var SERVER_CONFIG = JSON.parse(contents);

    var app = express();
    app.set('views','./views/mysql');
    app.set('view engine', 'jade');
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(session({
        secret: SERVER_CONFIG.SESSION.secret,
        resave: false,
        saveUninitialized: true,
        store:new MySQLStore(SERVER_CONFIG.MYSQL.ConnectionFlags)
        }
    ));
    app.locals.pretty = true;

    return app;
}