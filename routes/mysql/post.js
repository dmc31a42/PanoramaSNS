odule.exports = function(conn){
    var path = require('path');
    var dir = path.join(__dirname, 'public');
    dir = path.join(dir, '../../../uploads');
    var route = require('express').Router();  
    var crypto = require('crypto');
    var mime = require('mime');
    route.get('/:id', function(req, res){

    });
    route.post('/:id/edit', function(req, res){

    })
    return route;
}