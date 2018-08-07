module.exports = function(){
  var route = require('express').Router();
  route.get('/', function(req, res){
    if(req.user) {
      var message = {};
      message.user = req.user;
      res.render('./profile',message);
    } else {
      res.status(404);
      res.redirect('/auth/login');
    }
  });
  return route;
}