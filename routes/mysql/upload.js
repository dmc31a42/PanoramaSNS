module.exports = function(){
  var path = require('path');
  var dir = path.join(__dirname, 'public');
  var route = require('express').Router();
  var multer = require('multer');
  var crypto = require('crypto');
  var mime = require('mime');
  var storage = multer.diskStorage({
    destination: function(req, file, cb){
      cb(null, './uploads/');
    },
    filename: function(req, file, cb){
      crypto.pseudoRandomBytes(16, function(err, raw) {
        cb(null, raw.toString('hex') + '.' + mime.getExtension(file.mimetype));
      });
    }
  })
  var upload = multer({storage: storage});

  route.get('/',function(req, res){
    res.render('./upload');
  })
  route.post('/', upload.single('userfile'), function(req, res){
    console.log(req.file);
    //res.send('Uploaded : ' + req.file.filename);
    res.redirect('/view/' + req.file.filename);
  });

  return route;
}