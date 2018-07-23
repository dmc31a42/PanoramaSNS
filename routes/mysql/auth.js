module.exports = function(passport, conn){
    var route = require('express').Router();
    var bkfd2Password = require("pbkdf2-password");
    var hasher = bkfd2Password();
    var request = require('request');

    route.get('/login', function(req, res){
      var message = {};
      var errors = req.flash('error');
      if(errors){
        message.errors = errors;
      }
      if(req.user){
        res.redirect('/profile');
      }
      res.render('./auth/login',message);
    });
    route.post(
      '/login',
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
          res.redirect('/topic');
        })
      }
    );
    route.get('/logout', function(req, res){
      req.logout();
      req.session.save(function(){
        res.redirect('/topic');
      });
    });
    route.get('/facebook', passport.authenticate('facebook', {
      scope:
      [
        'email'
      ]
    }));
    route.get('/unlink', function(req, res){
      switch(req.query.service){
        case "local":
          break;
        case "facebook":
          request({
            uri: "https://graph.facebook.com/v3.0/" 
              + req.user.facebookId 
              + "/permissions?access_token=" 
              + req.user.facebookAccessToken,
            method: "DELETE",
          }, function(error, res, body){
            console.log(body);
            var JSONResults = JSON.parse(body);
            if(JSONResults.success && JSONResults.success == true){
              req.user.facebookAccessToken = null;
              req.user.facebookId = null;
            }
          });
          break;
        case "google":
          break;
        case "twitter":
          break;
        case "kakao":
          break;
      }
      var sql = 'UPDATE users SET ? WHERE id=?';
      conn.query(sql, [req.user, req.user.id], function(err, results){
        if(err){
          console.log(err);
          res.status(500);
        } else {
          res.redirect('/profile');
        }
      });
    })
    route.get('/link/local', function(req, res, next){
      res.render('./auth/link/local',{'user': req.user});
    })
    route.post('/link/local', function(req, res, next){
      var sql = 'SELECT * FROM users WHERE localId=?'
      conn.query(sql,req.body.username, function(err, results){
        if(err) {

        } else if(results.length>0){

        } else {
          hasher({password:req.body.password}, function(err, pass, salt, hash){
            var user = {
              localId: req.body.username,
              password:hash,
              salt:salt
            };
            var sql = 'UPDATE users SET ? WHERE id=?';
            conn.query(sql, [user, req.user.id],function(err, results){
              if(err){
                console.log(err);
                res.status(500);
              } else if(results.changedRows!=1){
                console.log(err);
                res.status(500);
              } else {
                req.user.localId = user.localId;
                req.user.password = user.password;
                req.user.salt = user.salt;
                //req.login(results[0], function(err){
                req.session.save(function(){
                  res.redirect('/profile');
                });
                //});
              }
            })
          });
        }
      });
    })

    route.get('/link/oauth', function(req, res, next){
      var newuserString = req.flash('LinkRequired');
      if(newuserString.length!=0) {
        var newuser = JSON.parse(newuserString[0]);
        req.session.tempuser = newuser;
        req.session.save(function(){
          res.render('./auth/link/oauth', {
            'user': req.user,
            'newuser': newuser
          });
        })
      } else {
        res.status(404);
        return res.redirect('/auth/login');
      }
    });
    route.post('/link/oauth', function(req, res){
      if(req.session.tempuser){
        var sql = 'UPDATE users SET ? WHERE id=?';
        var newuser = {};
        if(req.session.tempuser.facebookId){
          newuser.facebookId = req.session.tempuser.facebookId;
          newuser.facebookAccessToken = req.session.tempuser.facebookAccessToken;
        } else if(req.session.tempuser.googleId){
          newuser.googleId = req.session.tempuser.googleId;
          newuser.googleAccessToken = req.session.tempuser.googleAccessToken;
        } else if(req.session.tempuser.twitterId){
          newuser.twitterId = req.session.tempuser.twitterId;
          newuser.twitterAccessToken = req.session.tempuser.twitterAccessToken;
        }
        delete req.session['tempuser'];
        conn.query(sql, [newuser, req.user.id], function(err, results){
          if(err){
            console.log(err);
            res.status(500);
            res.redirect('/auth/login');
          } else {
            req.logIn(results[0], function(err){
              req.session.save(function(){
                res.redirect('/profile');
              })
            })
          }
        });
      } else {
        res.status(404);
        return res.redirect('/auth/login');
      }
    })
    function OAuthCallback(req, res, next){
      return function OAuthCallback_internal(err, user, info){
        if(info && info.code){
          if(info.code == "RegisterRequired"){
            req.flash('RegisterRequired',JSON.stringify(info.newuser));
            return res.redirect('/auth/register/oauth');
          } else if(info.code == "LinkRequired"){
            req.flash('LinkRequired',JSON.stringify(info.newuser));
            return res.redirect('/auth/link/oauth');
          } else {
            res.status(500);
            return res.redirect('/auth/login');
          }
        } else if (err || !user) {
          res.status(500);
          return res.redirect('/auth/login');
        } else{
          req.logIn(user, function(err) {
            if (err) { 
              return res.redirect('/auth/login');
            }
            return req.session.save(function(){
              res.redirect('/topic');
            });
          });
        }
      }
    }
    route.get('/facebook/callback', function(req, res, next) {
      passport.authenticate('facebook', OAuthCallback(req, res, next))(req, res, next);
    });
    route.get('/google', passport.authenticate('google', {
      scope:
      [
        'https://www.googleapis.com/auth/plus.login',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    }));
    route.get('/google/callback', function(req, res, next) {
      passport.authenticate('google', OAuthCallback(req, res, next))(req, res, next);
    });
    route.get('/twitter', passport.authenticate('twitter', {
      // scope:
      // [
      //   'https://www.googleapis.com/auth/plus.login',
      //   'https://www.googleapis.com/auth/userinfo.email'
      // ]
    }));
    route.get('/twitter/callback', function(req, res, next) {
      passport.authenticate('twitter', OAuthCallback(req, res, next))(req, res, next);
    });
    route.post('/register', function(req, res){
      hasher({password:req.body.password}, function(err, pass, salt, hash){
        var user = {
          localId: req.body.username,
          password:hash,
          salt:salt,
          displayName:req.body.displayName,
          //email: 'TEMP@temp.com'
        };
        var sql = 'INSERT INTO users SET ?';
        conn.query(sql, user,function(err, results){
          if(err){
            console.log(err);
            res.status(500);
          } else {
            user.id = results.insertId;
            req.login(user, function(err){
              req.session.save(function(){
                res.redirect('/topic');
              });
            });
          }
        })
      });
    });
    route.get('/register/oauth',function(req,res){
      var newuserString = req.flash('RegisterRequired');
      if(newuserString.length!=0){
        var newuser = JSON.parse(newuserString[0]);
        req.session.tempuser = newuser;
        req.session.save(function(){
          var user = newuser;
          if(!user.displayName){
            user.displayName = "";
          }
          if(!user.email){
            user.email = "";
          }
          res.render('./auth/register/oauth',{
            'newuser':user
          });
        })
      } else {
        res.status(404);
        return res.redirect('/auth/login');
      }
    });
    route.post('/register/oauth', function(req, res){
      if(req.session.tempuser){
        var sql = 'INSERT INTO users SET ?';
        var newuser = req.session.tempuser;
        newuser.displayName = req.body.displayName;
        newuser.email = req.body.email;
        delete req.session['tempuser'];
        conn.query(sql, newuser, function(err, results){
          if(err){
            console.log(err);
            res.status(500);
            res.redirect('/auth/login');
          } else {
            newuser.id = results.insertId;
            req.login(newuser, function(err){
              req.session.save(function(){
                res.redirect('/topic');
              });
            });
          }
        });
      }
    });
    route.get('/register', function(req, res){
      res.render('./auth/register');
    });
    route.post('/unregister', function(req, res){
      if(req.user){
        var id = req.user.id;
        var sql = 'DELETE FROM users WHERE id=?'
        conn.query(sql, id, function(err, results){
          if(err){
            console.log(err);
            res.status(500);
          } else {
            req.logout();
            req.session.save(function(){
              req.flash('unregister','Unregisted');
              res.redirect('/topic');
            })
          }
        });
      } else {
        res.status(404);
      }
    });
    return route;
}