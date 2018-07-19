module.exports = function(){
    var route = require('express').Router();
    route.get('/', function(req, res){
        var message = {};
        message.user = req.user;
        res.render('./profile',message);
      });
    return route;
}