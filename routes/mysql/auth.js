module.exports = function(passport, conn){
    var route = require('express').Router();
    var bkfd2Password = require("pbkdf2-password");
    var hasher = bkfd2Password();
    route.get('/login', function(req, res){
      var message = {};
      var errors = req.flash('error');
      if(errors){
        message.errors = errors;
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
    route.get('/link', function(req, res, next){
      var newuserString = req.flash('LinkRequired');
      if(newuserString.length!=0) {
        var newuser = JSON.parse(newuserString[0]);
        req.session.tempuser = newuser;
        req.session.save(function(){
          res.render('./auth/link', {
            'user': req.user,
            'newuser': newuser
          });
        })
      } else {
        res.status(404);
        return res.redirect('/auth/login');
      }
    });
    route.post('/link', function(req, res){
      if(req.session.tempuser){
        var sql = 'UPDATE users SET ? WHERE id=?';
        var newuser = {};
        if(req.session.tempuser.facebookId){
          newuser.facebookId = req.session.tempuser.facebookId;
        } else if(req.session.tempuser.googleId){
          newuser.googleId = req.session.tempuser.googleId;
        } else if(req.session.tempuser.twitterId){
          newuser.twitterId = req.session.tempuser.twitterId;
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
            return res.redirect('/auth/link');
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
        // var newuser = {
        //   'authId': req.session.tempauthId,
        //   'displayName': req.body.displayName,
        //   'email': req.body.email
        // };
        var newuser = {
          'displayName': req.body.displayName,
          'email': req.body.email 
        };
        if(req.session.tempuser.facebookId){
          newuser.facebookId = req.session.tempuser.facebookId;
        } else if(req.session.tempuser.googleId){
          newuser.googleId = req.session.tempuser.googleId;
        } else if(req.session.tempuser.twitterId){
          newuser.twitterId = req.session.tempuser.twitterId;
        }
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
      var sql = 'SELECT id,title FROM topic';
      conn.query(sql, function(err, topics, fields){
        res.render('./auth/register',{topics:topics});
      });
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