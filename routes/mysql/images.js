module.exports = function(conn){
  var route = require('express').Router();
  var path = require('path');
  var fs = require('fs');
  var dir = path.join(__dirname, 'public');
  dir = path.join(dir, '../../../uploads');
  var mime = require('mime');

  route.get('/:id',function(req, res){
    var sql = 'SELECT * from tempImage WHERE id=?';
    conn.query(sql,req.params.id, function(err, results){
      if(err){
        return res.status(500);
      } else if(results.length != 1){
        return res.status(404);
      } else {
        var tempImage = results[0];
        var now = new Date();
        if((tempImage.expiredTime.getTime() - now.getTime())<0){
          var sql = 'DELETE FROM tempImage WHERE id=?';
          conn.query(sql, tempImage.id, function(err, results){
            console.log(err);
            console.log(results);
          });
          return res.status(403);
        } else {
          var file = path.join(dir + '/' + results[0].filename);
          if (file.indexOf(dir + path.sep) !== 0) {
            return res.status(403).end('Forbidden');
          }
          var type = mime.getType(path.extname(file).slice(1)) || 'text/plain';
          var s = fs.createReadStream(file);
          s.on('open', function () {
            res.set('Content-Type', type);
            s.pipe(res);
          });
          s.on('error', function () {
            res.set('Content-Type', 'text/plain');
            res.status(404).end('Not found');
          });
        }
      }
    });
  })   
  return route;
}