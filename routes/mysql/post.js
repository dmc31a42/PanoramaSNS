module.exports = function(conn){
  var path = require('path');
  var dir = path.join(__dirname, 'public');
  dir = path.join(dir, '../../../uploads');
  var route = require('express').Router();  
  var crypto = require('crypto');
  var mime = require('mime');
  route.get('/:id', function(req, res){
    var sql = 'SELECT * from post WHERE id=';
    conn.query(sql, req.params.id, function(err, results){
      console.log(results);
    })
  });
  route.get('/:id/edit', function(req, res){
    var sql = 'SELECT * from post WHERE id=?';
    conn.query(sql, req.params.id, function(err, results){
      console.log(results);
    })
  })
  return route;
}