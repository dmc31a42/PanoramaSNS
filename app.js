var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var MySQLStore = require('express-mysql-session')(session);
var bodyParser = require('body-parser');
var bkfd2Password = require("pbkdf2-password");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var hasher = bkfd2Password();
var mysql = require('mysql');
var conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '111111',
  database: 'o2',
});
conn.connect();
var fs = require('fs');
var contents = fs.readFileSync('./OAuth.key.json');
var OAuth_Key = JSON.parse(contents);

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: '1234DSFs@adf1234!@#$asd',
  resave: false,
  saveUninitialized: true,
  store:new MySQLStore({
    host: 'localhost',
    port: 3306,
    user:'root',
    password: '111111',
    database: 'o2'
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.get('/count', function(req, res){
  if(req.session.count) {
    req.session.count++;
  } else {
    req.session.count = 1;
  }
  res.send('count : '+req.session.count);
});
app.get('/auth/logout', function(req, res){
  req.logout();
  req.session.save(function(){
    res.redirect('/welcome');
  });
});
app.get('/welcome', function(req, res){
  if(req.user && req.user.displayName) {
    res.send(`
      <h1>Hello, ${req.user.displayName}</h1>
      <a href="/auth/logout">logout</a>
    `);
  } else {
    res.send(`
      <h1>Welcome</h1>
      <ul>
        <li><a href="/auth/login">Login</a></li>
        <li><a href="/auth/register">Register</a></li>
      </ul>
    `);
  }
});
passport.serializeUser(function(user, done) {
  console.log('serializeUser', user);
  done(null, user.authId);
});
passport.deserializeUser(function(id, done) {
  console.log('deserializeUser', id);
  var sql = 'SELECT * from users WHERE authId=?';
  conn.query(sql, id, function(err, results){
    if(err){
      done(err);
    } else {
      done(null, results[0]);
    }
  });
});
passport.use(new LocalStrategy(
  function(username, password, done){
    var uname = username;
    var pwd = password;
    var sql = 'SELECT * from users WHERE authId=?';
    conn.query(sql, ['local:'+ uname],function(err,results){
      console.log(results);
      if(err){
        return done(err);
      } else {
        var user = results[0];
        return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
          if(hash === user.password){
            console.log('LocalStrategy', user);
            done(null, user);
          } else {
            done(null, false);
          }
        });
      }
    })
  }
));
passport.use(new FacebookStrategy({
  clientID: OAuth_Key.FACEBOOK_APP_ID,
  clientSecret: OAuth_Key.FACEBOOK_APP_SECRET,
  callbackURL: "/auth/facebook/callback",
  profileFields:['id', 'email','name', 'displayName']
},
function(accessToken, refreshToken, profile, done) {
  console.log(profile);
  var authId = 'facebook:' + profile.id;
  var sql = 'SELECT * from users WHERE authId=?';
  conn.query(sql, authId, function(err, results){
    if(results.length>0){
      done(null, results[0]);
    } else {
      var sql1 = 'INSERT INTO users SET ?';
      var newuser = {
        'authId':authId,
        'displayName':profile.displayName,
        'email':profile.emails[0].value,
      };
      conn.query(sql1, newuser, function(err, results){
        if(err){
          console.log(err);
          done(err);
        } else {
          done(null, newuser);
        }
      });
    }
  })
}
));
app.post(
  '/auth/login',
  passport.authenticate(
    'local',
    {
      //successRedirect: '/welcome',
      failureRedirect: '/auth/login',
      failureFlash: false
    }
  ),
  function(req, res){
    req.session.save(function(){
      res.redirect('/welcome');
    })
  }
);
app.get(
  '/auth/facebook',
  passport.authenticate(
    'facebook',
    {
      scope:
      [
        'email'
      ]
    }
  )
);
app.get(
  '/auth/facebook/callback',
  passport.authenticate(
    'facebook', 
    { 
      //successRedirect: '/welcome',
      failureRedirect: '/auth/login'
    }
  ),
  function(req, res){
    req.session.save(function(){
      res.redirect('/welcome');
    })
  }
);
var users = [
  {
    authId:'local:egoing',
    username:'egoing',
    password:'mTi+/qIi9s5ZFRPDxJLY8yAhlLnWTgYZNXfXlQ32e1u/hZePhlq41NkRfffEV+T92TGTlfxEitFZ98QhzofzFHLneWMWiEekxHD1qMrTH1CWY01NbngaAfgfveJPRivhLxLD1iJajwGmYAXhr69VrN2CWkVD+aS1wKbZd94bcaE=',
    salt:'O0iC9xqMBUVl3BdO50+JWkpvVcA5g2VNaYTR5Hc45g+/iXy4PzcCI7GJN5h5r3aLxIhgMN8HSh0DhyqwAp8lLw==',
    displayName:'Egoing'
  }
];
app.post('/auth/register', function(req, res){
  hasher({password:req.body.password}, function(err, pass, salt, hash){
    var user = {
      username:req.body.username,
      authId:'local:' + req.body.username,
      password:hash,
      salt:salt,
      displayName:req.body.displayName,
      email: 'TEMP@temp.com'
    };
    var sql = 'INSERT INTO users SET ?';
    conn.query(sql, user,function(err, results){
      if(err){
        console.log(err);
        res.status(500);
      } else {
        req.login(user, function(err){
          req.session.save(function(){
            res.redirect('/welcome');
          });
        });
      }
    })
  });
});
app.get('/auth/register', function(req, res){
  var output = `
  <h1>Register</h1>
  <form action="/auth/register" method="post">
    <p>
      <input type="text" name="username" placeholder="username">
    </p>
    <p>
      <input type="password" name="password" placeholder="password">
    </p>
    <p>
      <input type="text" name="displayName" placeholder="displayName">
    </p>
    <p>
      <input type="submit">
    </p>
  </form>
  `;
  res.send(output);
});
app.get('/auth/login', function(req, res){
  var output = `
  <h1>Login</h1>
  <form action="/auth/login" method="post">
    <p>
      <input type="text" name="username" placeholder="username">
    </p>
    <p>
      <input type="password" name="password" placeholder="password">
    </p>
    <p>
      <input type="submit">
    </p>
  </form>
  <a href="/auth/facebook">facebook</a>
  `;
  res.send(output);
});
app.listen(3003, function(){
  console.log('Connected 3003 port!!!');
});
