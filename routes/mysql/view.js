module.exports = function(){
  var route = require('express').Router();
  var path = require('path');
  var fs = require('fs');
  var dir = path.join(__dirname, 'public');
  dir = path.join(dir, '../../../uploads');
  var mime = require('mime');

  route.get('/:filename',function(req, res){
    var file = path.join(dir + '/' + req.params.filename);
    if (file.indexOf(dir + path.sep) !== 0) {
      return res.status(403).end('Forbidden');
    }
    var type = mime._types[path.extname(file).slice(1)] || 'text/plain';
    var s = fs.createReadStream(file);
    s.on('open', function () {
      res.set('Content-Type', type);
      s.pipe(res);
    });
    s.on('error', function () {
      res.set('Content-Type', 'text/plain');
      res.status(404).end('Not found');
    });
  })   
  return route;
}