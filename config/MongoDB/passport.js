module.exports = function(app){
  const passport = require('passport');
  const LocalStrategy = require('passport-local').Strategy;
  const FacebookStrategy = require('passport-facebook').Strategy;
  const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
  const TwitterStrategy = require('passport-twitter').Strategy;
  const KakaoStrategy = require('passport-kakao').Strategy;
  const bkfd2Password = require("pbkdf2-password");
  const hasher = bkfd2Password();
  const SERVER_CONFIG = require('./config.json')
  app.use(passport.initialize());
  app.use(passport.session());

  // [[models]]
  const User = require('../../models/user').model;
  
  passport.serializeUser(function(user, done) {
    console.log('serializeUser', user);
    done(null, user.id);
  });
  passport.deserializeUser(function(id, done) {
    console.log('deserializeUser', id);
    User.findById(id)
    .then((user)=>{
      done(null, user);
    })
    .catch((err)=>{
      done(err);
    })
  });
  passport.use(new LocalStrategy(
    function(username, password, done){
      User.findOne({
        'local.id': username
      })
      .then((user)=>{
        if(user) {
          return hasher({password:password, salt:user.local.salt}, function(err, pass, salt, hash){
            if(hash === user.local.password){
              console.log('LocalStrategy', user);
              return done(null, user);
            } else {
              return done(null, false);
            }
          })
        } else {
          return done(null, false);
        }
      })
      .catch((err)=>{
        return done(err);
      })
      // var uname = username;
      // var pwd = password;
      // var sql = 'SELECT * from users WHERE localId=?';
      // conn.query(sql, [uname],function(err,results){
      //   console.log(results);
      //   if(err){
      //     return done(err);
      //   } else if(results.length === 0) {
      //     return done('There is no user');
      //   } else {
      //     var user = results[0];
      //     return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
      //       if(hash === user.password){
      //         console.log('LocalStrategy', user);
      //         done(null, user);
      //       } else {
      //         done(null, false);
      //       }
      //     });
      //   }
      // })
    }
  ));
  // function OAuthStrategy(req, done, newuser){
  //   return function(err, results) {
  //     if(err){
  //       done(err);
  //     } else if(results.length>0){
  //       if(req.user){
  //         done({'code':'AlreadyAccountExist'});
  //       } else {
  //         done(null, results[0]);
  //       }
  //     } else {
  //       if(req.user){
  //         done(null, req.user, {'code':"LinkRequired",'newuser':newuser});
  //       } else {
  //         done(null, null, {'code':"RegisterRequired",'newuser':newuser});
  //       }
  //     }
  //   }
  // }
  // passport.use(new FacebookStrategy({
  //     clientID: SERVER_CONFIG.FACEBOOK.FACEBOOK_APP_ID,
  //     clientSecret: SERVER_CONFIG.FACEBOOK.FACEBOOK_APP_SECRET,
  //     callbackURL: SERVER_CONFIG.HOST.Default_URL + "/auth/facebook/callback",
  //     profileFields:['id', 'email','name', 'displayName'],
  //     passReqToCallback: true
  //   },
  //   function(req, accessToken, refreshToken, profile, done) {
  //     console.log(profile);
  //     var newuser = {
  //       'facebookId':profile.id,
  //       'facebookAccessToken': accessToken,
  //       'displayName':profile.displayName,
  //       'email':profile.emails[0].value,
  //     };
  //     var sql = 'SELECT * from users WHERE facebookId=?';
  //     conn.query(sql, newuser.facebookId, OAuthStrategy(req, done, newuser));
  //   }
  // ));
  // passport.use(new GoogleStrategy({
  //     clientID: SERVER_CONFIG.GOOGLE.GOOGLE_CLIENT_ID,
  //     clientSecret: SERVER_CONFIG.GOOGLE.GOOGLE_CLIENT_SECRET,
  //     callbackURL: SERVER_CONFIG.HOST.Default_URL + "/auth/google/callback",
  //     passReqToCallback: true,
  //   }, function(req, accessToken, refreshToken, profile, done){
  //     console.log(profile);
  //     var newuser = {
  //       'googleId':profile.id,
  //       'googleAccessToken': accessToken,
  //       'displayName':profile.displayName,
  //       'email':profile.emails[0].value,
  //     };
  //     var sql = 'SELECT * from users WHERE googleId=?';
  //     conn.query(sql, newuser.googleId, OAuthStrategy(req, done, newuser));
  //   }
  // ));
  // passport.use(new TwitterStrategy({
  //   consumerKey: SERVER_CONFIG.TWITTER.consumerKey,
  //   consumerSecret: SERVER_CONFIG.TWITTER.consumerSecret,
  //   callbackURL: SERVER_CONFIG.HOST.Default_URL + "/auth/twitter/callback",
  //   profileFields: ['id', 'displayName', 'username', 'photos', '_json'],
  //   passReqToCallback: true
  // }, function(req, accessToken, tokenSecret, profile, done){
  //   console.log(profile);
  //   var newuser = {
  //     'twitterId':profile.id,
  //     'twitterAccessToken': accessToken,
  //     'displayName': profile.displayName,
  //     // 'email': profile.emails[0].value, https://github.com/jaredhanson/passport-twitter/issues/67
  //   };
  //   var sql = 'SELECT * from users WHERE twitterId=?';
  //   conn.query(sql, newuser.twitterId, OAuthStrategy(req, done, newuser));
  // }));
  // passport.use(new KakaoStrategy({
  //   clientID: SERVER_CONFIG.KAKAO.clientID,
  //   callbackURL: SERVER_CONFIG.HOST.Default_URL + "/auth/kakao/callback",
  //   passReqToCallback: true,
  // }, function(req, accessToken, refreshToken, profile, done){
  //   console.log(profile);
  //   var newuser = {
  //     'kakaoId': profile.id,
  //     'kakaoAccessToken': accessToken,
  //     'displayName': profile.username,
  //   };
  //   var sql = 'SELECT * from users WHERE kakaoId=?';
  //   conn.query(sql, newuser.kakaoId, OAuthStrategy(req, done, newuser));
  // }))
  return passport;
}