module.exports = function(){
  const express = require('express');
  const session = require('express-session');
  const MongoStore = require('connect-mongo')(session);
  const bodyParser = require('body-parser');
  const flash = require('connect-flash');
  const SERVER_CONFIG = require('./config.json');

  var app = express();
  app.set('views','./views/MongoDB');
  app.set('view engine', 'jade');
  app.use(flash());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(session({
    secret: SERVER_CONFIG.SESSION.secret,
    resave: false,
    saveUninitialized: true,
    store:new MongoStore({
      url:SERVER_CONFIG.MongoDB.URL,
      ttl: 60*60*24*7  // 7 days (default: 14days)
    })
  }));
  app.locals.pretty = true;

  return app;
}