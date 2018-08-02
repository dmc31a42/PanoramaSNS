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
        User.find({
          local: {
            id: req.body.username
          }
        })
        .then((user) =>{
          console.log(user);
          if(user.length == 0) {
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
          }
        }).catch((err)=>{
          res.status(500);
          res.json(err);
        })

        // var sql = 'INSERT INTO users SET ?';
        // conn.query(sql, user,function(err, results){
        //   if(err){
        //     console.log(err);
        //     res.status(500);
        //   } else {
        //     user.id = results.insertId;
        //     req.login(user, function(err){
        //       req.session.save(function(){
        //         res.redirect('/topic');
        //       });
        //     });
        //   }
        // })
      });
    });
    // route.get('/register/oauth',function(req,res){
    //   var newuserString = req.flash('RegisterRequired');
    //   if(newuserString.length!=0){
    //     var newuser = JSON.parse(newuserString[0]);
    //     req.session.tempuser = newuser;
    //     req.session.save(function(){
    //       var user = newuser;
    //       if(!user.displayName){
    //         user.displayName = "";
    //       }
    //       if(!user.email){
    //         user.email = "";
    //       }
    //       res.render('./auth/register/oauth',{
    //         'newuser':user
    //       });
    //     })
    //   } else {
    //     res.status(404);
    //     return res.redirect('/auth/login');
    //   }
    // });
    // route.post('/register/oauth', function(req, res){
    //   if(req.session.tempuser){
    //     var sql = 'INSERT INTO users SET ?';
    //     var newuser = req.session.tempuser;
    //     newuser.displayName = req.body.displayName;
    //     newuser.email = req.body.email;
    //     delete req.session['tempuser'];
    //     conn.query(sql, newuser, function(err, results){
    //       if(err){
    //         console.log(err);
    //         res.status(500);
    //         res.redirect('/auth/login');
    //       } else {
    //         newuser.id = results.insertId;
    //         req.login(newuser, function(err){
    //           req.session.save(function(){
    //             res.redirect('/topic');
    //           });
    //         });
    //       }
    //     });
    //   }
    // });


    // route.get('/login', function(req, res){
    //   var message = {};
    //   var errors = req.flash('error');
    //   if(errors){
    //     message.errors = errors;
    //   }
    //   if(req.user){
    //     return res.redirect('/profile');
    //   }
    //   res.render('./auth/login',message);
    // });
    // route.post(
    //   '/login',
    //   passport.authenticate(
    //     'local',
    //     {
    //       //successRedirect: '/welcome',
    //       failureRedirect: '/auth/login',
    //       failureFlash: false
    //     }
    //   ),
    //   function(req, res){
    //     req.session.save(function(){
    //       res.redirect('/topic');
    //     })
    //   }
    // );
    // route.get('/logout', function(req, res){
    //   req.logout();
    //   req.session.save(function(){
    //     res.redirect('/topic');
    //   });
    // });
    // route.get('/facebook', passport.authenticate('facebook', {
    //   scope:
    //   [
    //     'email'
    //   ]
    // }));
    // function updateUser(req, res){
    //   var sql = 'UPDATE users SET ? WHERE id=?';
    //   conn.query(sql, [req.user, req.user.id], function(err, results){
    //     if(err){
    //       console.log(err);
    //       res.status(500);
    //     } else {
    //       res.redirect('/profile');
    //     }
    //   });
    // }
    // function returnToProfile(res, req){
    //   res.status(500);
    //   return res.redirect('/profile');
    // }
    // function unlinkLocal(req, res, successCallback, failureCallback){
    //   if(!successCallback){
    //     successCallback = updateUser;
    //   }
    //   if(!failureCallback){
    //     failureCallback = returnToProfile;      
    //   }
    //   req.user.localId = null;
    //   req.user.password = null;
    //   req.user.salt = null;
    //   successCallback(req, res);
    // }
    // function unlinkFacebook(req, res, successCallback, failureCallback){
    //   if(!successCallback){
    //     successCallback = updateUser;
    //   }
    //   if(!failureCallback){
    //     failureCallback = returnToProfile;      
    //   }
    //   request({
    //     uri: "https://graph.facebook.com/v3.0/" 
    //       + req.user.facebookId 
    //       + "/permissions?access_token=" 
    //       + req.user.facebookAccessToken,
    //     method: "DELETE",
    //   }, function(error, request_res, body){
    //     console.log(body);
    //     var JSONResults = JSON.parse(body);
    //     if(JSONResults.success && JSONResults.success == true){
    //       req.user.facebookAccessToken = null;
    //       req.user.facebookId = null;
    //       successCallback(req, res);
    //     } else {
    //       failureCallback(res,req);
    //     }
    //   });
    // }
    // function unlinkGoogle(req, res, successCallback, failureCallback){
    //   if(!successCallback){
    //     successCallback = updateUser;
    //   }
    //   if(!failureCallback){
    //     failureCallback = returnToProfile;      
    //   }
    //   request({
    //     uri: "https://accounts.google.com/o/oauth2/revoke?token=" + req.user.googleAccessToken,
    //     headers: {
    //       "Content-type": "application/x-www-form-urlencoded"
    //     }, 
    //     method: "GET",
    //   }, function(err, request_res, body){
    //     console.log(request_res);
    //     if(request_res.statusCode == 200){
    //       req.user.googleAccessToken = null;
    //       req.user.googleId = null;
    //       successCallback(req, res);
    //     } else {
    //       failureCallback(res,req);
    //     }
    //   })
    // }
    // function unlinkTwitter(req, res, successCallback, failureCallback){
    //   if(!successCallback){
    //     successCallback = updateUser;
    //   }
    //   if(!failureCallback){
    //     failureCallback = returnToProfile;      
    //   }
    //   req.user.twitterAccessToken = null;
    //   req.user.twitterId = null;
    //   successCallback(req, res);
    // }
    // function unlinkKakao(req, res, successCallback, failureCallback){
    //   if(!successCallback){
    //     successCallback = updateUser;
    //   }
    //   if(!failureCallback){
    //     failureCallback = returnToProfile;      
    //   }
    //   request({
    //     uri: "https://kapi.kakao.com/v1/user/unlink",
    //     headers: {
    //       "Authorization": "Bearer " + req.user.kakaoAccessToken
    //     }, 
    //     method: "POST",
    //   }, function(err, request_res, body){
    //     console.log(request_res);
    //     if(request_res.statusCode == 200){
    //       req.user.kakaoAccessToken = null;
    //       req.user.kakaoId = null;
    //       successCallback(req, res);
    //     } else {
    //       failureCallback(res,req);
    //     }
    //   })
    // }
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
    // route.get('/link/local', function(req, res, next){
    //   res.render('./auth/link/local',{'user': req.user});
    // })
    // route.post('/link/local', function(req, res, next){
    //   var sql = 'SELECT * FROM users WHERE localId=?'
    //   conn.query(sql,req.body.username, function(err, results){
    //     if(err) {

    //     } else if(results.length>0){

    //     } else {
    //       hasher({password:req.body.password}, function(err, pass, salt, hash){
    //         var user = {
    //           localId: req.body.username,
    //           password:hash,
    //           salt:salt
    //         };
    //         var sql = 'UPDATE users SET ? WHERE id=?';
    //         conn.query(sql, [user, req.user.id],function(err, results){
    //           if(err){
    //             console.log(err);
    //             res.status(500);
    //           } else if(results.changedRows!=1){
    //             console.log(err);
    //             res.status(500);
    //           } else {
    //             req.user.localId = user.localId;
    //             req.user.password = user.password;
    //             req.user.salt = user.salt;
    //             //req.login(results[0], function(err){
    //             req.session.save(function(){
    //               res.redirect('/profile');
    //             });
    //             //});
    //           }
    //         })
    //       });
    //     }
    //   });
    // })

    // route.get('/link/oauth', function(req, res, next){
    //   var newuserString = req.flash('LinkRequired');
    //   if(newuserString.length!=0) {
    //     var newuser = JSON.parse(newuserString[0]);
    //     req.session.tempuser = newuser;
    //     req.session.save(function(){
    //       res.render('./auth/link/oauth', {
    //         'user': req.user,
    //         'newuser': newuser
    //       });
    //     })
    //   } else {
    //     res.status(404);
    //     return res.redirect('/auth/login');
    //   }
    // });
    // route.post('/link/oauth', function(req, res){
    //   if(req.session.tempuser){
    //     var sql = 'UPDATE users SET ? WHERE id=?';
    //     var newuser = {};
    //     if(req.session.tempuser.facebookId){
    //       newuser.facebookId = req.session.tempuser.facebookId;
    //       newuser.facebookAccessToken = req.session.tempuser.facebookAccessToken;
    //     } else if(req.session.tempuser.googleId){
    //       newuser.googleId = req.session.tempuser.googleId;
    //       newuser.googleAccessToken = req.session.tempuser.googleAccessToken;
    //     } else if(req.session.tempuser.twitterId){
    //       newuser.twitterId = req.session.tempuser.twitterId;
    //       newuser.twitterAccessToken = req.session.tempuser.twitterAccessToken;
    //     } else if(req.session.tempuser.kakaoId){
    //       newuser.kakaoId = req.session.tempuser.kakaoId;
    //       newuser.kakaoAccessToken = req.session.tempuser.kakaoAccessToken;
    //     }
    //     delete req.session['tempuser'];
    //     conn.query(sql, [newuser, req.user.id], function(err, results){
    //       if(err){
    //         console.log(err);
    //         res.status(500);
    //         res.redirect('/auth/login');
    //       } else {
    //         req.logIn(results[0], function(err){
    //           req.session.save(function(){
    //             res.redirect('/profile');
    //           })
    //         })
    //       }
    //     });
    //   } else {
    //     res.status(404);
    //     return res.redirect('/auth/login');
    //   }
    // })
    // function OAuthCallback(req, res, next){
    //   return function OAuthCallback_internal(err, user, info){
    //     if(info && info.code){
    //       if(info.code == "RegisterRequired"){
    //         req.flash('RegisterRequired',JSON.stringify(info.newuser));
    //         return res.redirect('/auth/register/oauth');
    //       } else if(info.code == "LinkRequired"){
    //         req.flash('LinkRequired',JSON.stringify(info.newuser));
    //         return res.redirect('/auth/link/oauth');
    //       } else {
    //         res.status(500);
    //         return res.redirect('/auth/login');
    //       }
    //     } else if (err || !user) {
    //       res.status(500);
    //       return res.redirect('/auth/login');
    //     } else{
    //       req.logIn(user, function(err) {
    //         if (err) { 
    //           return res.redirect('/auth/login');
    //         }
    //         return req.session.save(function(){
    //           res.redirect('/topic');
    //         });
    //       });
    //     }
    //   }
    // }
    // route.get('/facebook/callback', function(req, res, next) {
    //   passport.authenticate('facebook', OAuthCallback(req, res, next))(req, res, next);
    // });
    // route.get('/google', passport.authenticate('google', {
    //   scope:
    //   [
    //     'https://www.googleapis.com/auth/plus.login',
    //     'https://www.googleapis.com/auth/userinfo.email'
    //   ]
    // }));
    // route.get('/google/callback', function(req, res, next) {
    //   passport.authenticate('google', OAuthCallback(req, res, next))(req, res, next);
    // });
    // route.get('/twitter', passport.authenticate('twitter', {
    //   // scope:
    //   // [
    //   //   'https://www.googleapis.com/auth/plus.login',
    //   //   'https://www.googleapis.com/auth/userinfo.email'
    //   // ]
    // }));
    // route.get('/twitter/callback', function(req, res, next) {
    //   passport.authenticate('twitter', OAuthCallback(req, res, next))(req, res, next);
    // });
    // route.get('/kakao', passport.authenticate('kakao', {

    // }));
    // route.get('/kakao/callback', function(req, res, next){
    //   passport.authenticate('kakao', OAuthCallback(req, res, next))(req, res, next);
    // })
    // route.post('/register', function(req, res){
    //   hasher({password:req.body.password}, function(err, pass, salt, hash){
    //     var user = {
    //       localId: req.body.username,
    //       password:hash,
    //       salt:salt,
    //       displayName:req.body.displayName,
    //       //email: 'TEMP@temp.com'
    //     };
    //     var sql = 'INSERT INTO users SET ?';
    //     conn.query(sql, user,function(err, results){
    //       if(err){
    //         console.log(err);
    //         res.status(500);
    //       } else {
    //         user.id = results.insertId;
    //         req.login(user, function(err){
    //           req.session.save(function(){
    //             res.redirect('/topic');
    //           });
    //         });
    //       }
    //     })
    //   });
    // });
    // route.get('/register/oauth',function(req,res){
    //   var newuserString = req.flash('RegisterRequired');
    //   if(newuserString.length!=0){
    //     var newuser = JSON.parse(newuserString[0]);
    //     req.session.tempuser = newuser;
    //     req.session.save(function(){
    //       var user = newuser;
    //       if(!user.displayName){
    //         user.displayName = "";
    //       }
    //       if(!user.email){
    //         user.email = "";
    //       }
    //       res.render('./auth/register/oauth',{
    //         'newuser':user
    //       });
    //     })
    //   } else {
    //     res.status(404);
    //     return res.redirect('/auth/login');
    //   }
    // });
    // route.post('/register/oauth', function(req, res){
    //   if(req.session.tempuser){
    //     var sql = 'INSERT INTO users SET ?';
    //     var newuser = req.session.tempuser;
    //     newuser.displayName = req.body.displayName;
    //     newuser.email = req.body.email;
    //     delete req.session['tempuser'];
    //     conn.query(sql, newuser, function(err, results){
    //       if(err){
    //         console.log(err);
    //         res.status(500);
    //         res.redirect('/auth/login');
    //       } else {
    //         newuser.id = results.insertId;
    //         req.login(newuser, function(err){
    //           req.session.save(function(){
    //             res.redirect('/topic');
    //           });
    //         });
    //       }
    //     });
    //   }
    // });
    // route.get('/register', function(req, res){
    //   res.render('./auth/register');
    // });
    // function unregisterChainFacebook(req, res){
    //   if(req.user.facebookId){
    //     unlinkFacebook(req, res, unregisterChainGoogle)
    //   } else {
    //     unregisterChainGoogle(req, res);
    //   }
    // }
    // function unregisterChainGoogle(req, res){
    //   if(req.user.googleId){
    //     unlinkGoogle(req, res, unregisterChainTwitter)
    //   } else {
    //     unregisterChainTwitter(req, res);
    //   }
    // }
    // function unregisterChainTwitter(req, res){
    //   if(req.user.twitterId){
    //     unlinkTwitter(req, res, unregisterLast)
    //   } else {
    //     unregisterChainKakao(req, res);
    //   }
    // }
    // function unregisterChainKakao(req, res){
    //   if(req.user.kakaoId){
    //     unlinkKakao(req, res, unregisterLast)
    //   } else {
    //     unregisterLast(req, res);
    //   }
    // }
    // function unregisterLast(req, res){
    //   var id = req.user.id;
    //   var sql = 'DELETE FROM users WHERE id=?'
    //   conn.query(sql, id, function(err, results){
    //     if(err){
    //       console.log(err);
    //       res.status(500);
    //     } else {
    //       req.logout();
    //       req.session.save(function(){
    //         req.flash('unregister','Unregisted');
    //         res.redirect('/topic');
    //       })
    //     }
    //   });
    // }
    // route.post('/unregister', function(req, res){
    //   if(req.user){
    //     unregisterChainFacebook(req, res);
    //   } else {
    //     res.status(404);
    //   }
    // });
    return route;
}