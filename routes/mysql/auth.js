module.exports = function(passport, conn){
    var route = require('express').Router();
    var bkfd2Password = require("pbkdf2-password");
    var hasher = bkfd2Password();
    
    route.get('/logout', function(req, res){
      req.logout();
      req.session.save(function(){
        res.redirect('/topic');
      });
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
    route.get(
      '/facebook',
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
    route.get('/facebook/callback', function(req, res, next) {
      passport.authenticate('facebook',{failureFlash: true}, function(err, user, info) {
        if(err && err.code && err.code == "RegisterRequired"){
          req.flash('RegisterRequired',JSON.stringify(err.newuser));
          return res.redirect('/auth/register/oauth');
        }
        else if (err || !user) {
          res.status(500);
          return res.redirect('/auth/login');
        }
        req.logIn(user, function(err) {
          if (err) { 
            return res.redirect('/auth/login');
          }
          return req.session.save(function(){
            res.redirect('/topic');
          });
        });
      })(req, res, next);
    });
    route.get(
      '/google',
      passport.authenticate(
        'google',
        {
          scope:
          [
            'https://www.googleapis.com/auth/plus.login',
            'https://www.googleapis.com/auth/userinfo.email'
          ]
        }
      )
    );
    route.get(
      '/google/callback',
      passport.authenticate(
        'google', 
        { 
          //successRedirect: '/welcome',
          failureRedirect: '/auth/login'
        }
      ),
      function(req, res){
        req.session.save(function(){
          res.redirect('/topic');
        })
      }
    );
    route.post('/register', function(req, res){
      hasher({password:req.body.password}, function(err, pass, salt, hash){
        var user = {
          username:req.body.username,
          authId:'local:' + req.body.username,
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
        var sql = 'SELECT id,title FROM topic';
        conn.query(sql, function(err, topics, fields){
          res.render('./auth/register/oauth',{'newuser':newuser,topics:topics});
        });
        
      } else {
        res.status(404);
        return res.redirect('/auth/login');
      }
    });
    route.get('/register', function(req, res){
      var sql = 'SELECT id,title FROM topic';
      conn.query(sql, function(err, topics, fields){
        res.render('./auth/register',{topics:topics});
      });
    });
    route.get('/login', function(req, res){
      var sql = 'SELECT id,title FROM topic';
      conn.query(sql, function(err, topics, fields){
        res.render('./auth/login',{topics:topics});
      });
    });
    route.post('/unregister', function(req, res){
      if(req.user){
        var authId = req.user.authId;
        var sql = 'DELETE FROM users WHERE authId=?'
        conn.query(sql, authId, function(err, results){
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