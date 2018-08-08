module.exports = function(passport){
    const route = require('express').Router();
    const bkfd2Password = require("pbkdf2-password");
    const hasher = bkfd2Password();
    const request = require('request');
    const mongoose = require('mongoose');

    // [[ model ]]
    const User = require('../../models/user').model;

    // [[ register ]]
    route.get('/register', function(req, res){
      res.render('./auth/register');
    });

    route.post('/register', function(req, res){
      hasher({password:req.body.password}, function(err, pass, salt, hash){
        User.findOne({
          'local.id': req.body.username
        })
        .then((user) =>{
          console.log(user);
          if(!user) {
            return User({
              displayName:req.body.displayName,
              local: {
                id: req.body.username,
                password:hash,
                salt:salt,
              }
            }).save()
            .then((user)=>{
              req.logIn(user, function(err){
                req.session.save(function(){
                  return res.redirect('/profile');
                })
              })
            })
          } else {
            return Promise.reject('There is user already');
          }
        }).catch((err)=>{
          res.status(500);
          res.json(err);
        })
      });
    });
    route.get('/register/oauth',function(req,res){
      var newuserString = req.flash('RegisterRequired');
      if(newuserString.length!=0){
        var newuser = JSON.parse(newuserString[0]);
        req.session.tempuser = newuser;
        req.session.save(function(){
          res.render('./auth/register/oauth',{
            'newuser':newuser
          });
        })
      } else {
        res.status(404);
        return res.redirect('/auth/login');
      }
    });
    route.post('/register/oauth', function(req, res){
      if(req.session.tempuser){
        var newuser = req.session.tempuser;
        newuser.displayName = req.body.displayName;
        newuser.email = req.body.email;
        delete req.session['tempuser'];
        User.create(newuser)
        .then((user)=>{
          return req.logIn(user, function(err){
            return req.session.save(function(){
              return res.redirect('/profile');
            })
          })
        })
        .catch((err)=>{
          res.status(500);
          return res.json(err);
        });
      }
    });

    // [[ login ]]
    route.get('/login', function(req, res){
      if(req.user){
        return res.redirect('/profile');
      }
      res.render('./auth/login');
    })

    route.post('/login', passport.authenticate('local',
      {
        failureRedirect: '/auth/login',
        failureFlash: false
      }
    ), function(req, res){
      req.session.save(function(){
        res.redirect('/profile');
      })
    });

    
    // [[logout]]
    route.get('/logout', function(req, res){
      req.logout();
      req.session.save(function(){
        res.redirect('/auth/login');
      });
    });

    // [[OAuth login]]
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
              res.redirect('/profile');
            });
          });
        }
      }
    }

    route.get('/facebook', passport.authenticate('facebook', {
      scope:
      [
        'email'
      ]
    }));
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

    route.get('/kakao', passport.authenticate('kakao', {

    }));
    route.get('/kakao/callback', function(req, res, next){
      passport.authenticate('kakao', OAuthCallback(req, res, next))(req, res, next);
    })


    

   

    // route.get('/unlink', function(req, res){
    //   switch(req.query.service){
    //     case "local":
    //       unlinkLocal(req, res);
    //       break;
    //     case "facebook":
    //       unlinkFacebook(req, res);
    //       break;
    //     case "google":
    //       unlinkGoogle(req, res);
    //       break;
    //     case "twitter": // revoke 불가, 그냥 레코드에서 삭제해야함
    //       unlinkTwitter(req, res);
    //       break;
    //     case "kakao":
    //       unlinkKakao(req, res);
    //       break;
    //   }
    // });

    // [[link]]
    route.get('/link/local', function(req, res, next){
      res.render('./auth/link/local',{'user': req.user});
    })
    route.post('/link/local', function(req, res, next){
      User.findOne({'local.id': req.body.username})
      .then((user)=>{
        if(user){
          return new Promise.reject('There is local id already');
        }
        return new Promise(function(resolve, reject){
          hasher({password:req.body.password}, function(err, pass, salt, hash){
          req.user.local = {
            id: req.body.username,
            password: hash,
            salt: salt
          }
          return req.user.save()
          .then((user=>{resolve(user)}))
          .catch((err)=>reject(err));
        });})
      })
      .then((user)=>{
        return req.logIn(user, function(err){
          if(err){return new Promise.reject(err);}
          return req.session.save(function(){
            return res.redirect('/profile');
          })
        })
      })
      .catch((err)=>{
        res.status(500);
        res.json(err);
      })
    });


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
        if(req.session.tempuser.facebook){
          req.user.facebook = req.session.tempuser.facebook;
        } else if(req.session.tempuser.google){
          req.user.google = req.session.tempuser.google;
        } else if(req.session.tempuser.twitter){
          req.user.twitter = req.session.tempuser.twitter;
        } else if(req.session.tempuser.kakao){
          req.user.kakao = req.session.tempuser.kakao;
        }
        delete req.session['tempuser'];
        req.user.save()
        .then((user)=>{
          return req.logIn(user, function(err){
            return req.session.save(function(){
              return res.redirect('/profile');
          })});
        })
        .catch((err)=>{
          console.log(err);
          res.status(500);
          res.json(err);
        })
      } else {
        res.status(404);
        return res.redirect('/auth/login');
      }
    })
    
    // [[unlink & unregister]]

    function updateUser(req, res){
      req.user.save()
      .then((user)=>{
        res.redirect('/profile');
      })
      .catch((err)=>{
        console.log(err);
        res.status(500);
        res.json(err);
      })
    }
    function returnToProfile(res, req){
      res.status(500);
      res.redirect('/profile');
    }

    function unlinkLocal(req, res, callback){
      return new Promise(function(resolve, reject){
        req.user.update({$unset:{facebook:1}})
        .then((user)=>{
          if(callback){callback(null, user)}
          else {resolve(user)}
        })
        .catch((err)=>{
          if(callback){callback(err)}
          else {reject(err)}
        });
      })
    }
    function unlinkFacebook(req, res, callback){
      return new Promise(function(resolve, reject){
        request({
          uri: "https://graph.facebook.com/v3.0/" 
            + req.user.facebook.id 
            + "/permissions?access_token=" 
            + req.user.facebook.accessToken,
          method: "DELETE",
        }, function(error, request_res, body){
          console.log(body);
          var JSONResults = JSON.parse(body);
          if(JSONResults.success && JSONResults.success == true){
            req.user.update({$unset: {facebook: 1}})
            .then((user)=>{
              if(callback){callback(null, user)}
              else {resolve(user)}
            })
            .catch((err)=>{
              if(callback){callback(err)}
              else {reject(err)}
            })
          } else {
            if(callback){callback(err)}
            else {reject(err)}
          }
        });
      });
    }

    function unlinkGoogle(req, res, callback){
      return new Promise(function(resolve, reject){
        request({
          uri: "https://accounts.google.com/o/oauth2/revoke?token=" + req.user.google.accessToken,
          headers: {
            "Content-type": "application/x-www-form-urlencoded"
          }, 
          method: "GET",
        }, function(err, request_res, body){
          if(request_res.statusCode == 200){
            req.user.update({$unset:{google:1}})
            .then((user)=>{
              if(callback){callback(null, user)}
              else {resolve(user)}
            })
            .catch((err)=>{
              if(callback){callback(err)}
              else {reject(err)}
            })
          } else {
            if(callback){callback(err)}
            else {reject(err)}
          }
        })
      })
    }
    function unlinkTwitter(req, res, callback){
      return new Promise(function(resolve, reject){
        req.user.update({$unset:{twitter:1}})
        .then((user)=>{
          if(callback){callback(null, user)}
          else {resolve(user)}
        })
        .catch((err)=>{
          if(callback){callback(err)}
          else {reject(user)}
        })
      })
    }

    function unlinkKakao(req, res, callback){
      return new Promise(function(resolve, reject){
        request({
          uri: "https://kapi.kakao.com/v1/user/unlink",
          headers: {
            "Authorization": "Bearer " + req.user.kakao.accessToken
          }, 
          method: "POST",
        }, function(err, request_res, body){
          if(request_res.statusCode == 200){
            req.user.update({$unset:{kakao:1}})
            .then((user)=>{
              if(callback){callback(null, user)}
              else {resolve(user)}
            })
            .catch((err)=>{
              if(callback) {callback(err)}
              else {reject(err)}
            })
          } else {
            if(callback) {callback(err)}
            else {reject(err)}
          }
        })
      })
    }

    route.post('/unregister', function(req, res){
      if(req.user){
        Promise.all([
          unlinkLocal(req, res),
          unlinkFacebook(req, res),
          unlinkGoogle(req, res),
          unlinkTwitter(req, res),
          unlinkKakao(req, res)
        ])
        .then((values)=>{
          return req.user.remove()
        })
        .then((user)=>{
          req.logOut();
          req.session.save(function(){
            req.flash('unregister', 'Unregisted');
            res.redirect('/auth/login');
          })
        })
        .catch((err)=>{
          res.status(500);
          res.json(err);
        })
      } else {
        res.status(404);
      }
    });
    return route;
}