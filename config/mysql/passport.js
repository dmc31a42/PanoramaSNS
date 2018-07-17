module.exports = function(app, conn){
  var passport = require('passport');
  var LocalStrategy = require('passport-local').Strategy;
  var FacebookStrategy = require('passport-facebook').Strategy;
  var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
  var bkfd2Password = require("pbkdf2-password");
  var hasher = bkfd2Password();
  var fs = require('fs');
  var contents = fs.readFileSync('./config/mysql/config.json');
  var SERVER_CONFIG = JSON.parse(contents);
  app.use(passport.initialize());
  app.use(passport.session());
  
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
        } else if(results.length === 0) {
          return done('There is no user');
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
      clientID: SERVER_CONFIG.FACEBOOK.FACEBOOK_APP_ID,
      clientSecret: SERVER_CONFIG.FACEBOOK.FACEBOOK_APP_SECRET,
      callbackURL: SERVER_CONFIG.HOST.Default_URL + "/auth/facebook/callback",
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
          // var sql1 = 'INSERT INTO users SET ?';
          // var newuser = {
          //   'authId':authId,
          //   'displayName':profile.displayName,
          //   'email':profile.emails[0].value,
          // };
          // conn.query(sql1, newuser, function(err, results){
          //   if(err){
          //     console.log(err);
          //     done(err);
          //   } else {
          //     done(null, newuser);
          //   }
          // });
          var newuser = {
            'authId':authId,
            'displayName':profile.displayName,
            'email':profile.emails[0].value,
          };
          done({'code':"RegisterRequired",'newuser':newuser});
        }
      })
    }
  ));
  passport.use(new GoogleStrategy({
      clientID: SERVER_CONFIG.GOOGLE.GOOGLE_CLIENT_ID,
      clientSecret: SERVER_CONFIG.GOOGLE.GOOGLE_CLIENT_SECRET,
      callbackURL: SERVER_CONFIG.HOST.Default_URL + "/auth/google/callback",
    }, function(accessToken, refreshToken, profile, done){
      console.log(profile);
      var authId = 'google:' + profile.id;
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
  ))
  return passport;
}