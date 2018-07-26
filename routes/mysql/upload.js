module.exports = function(conn){
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
        cb(null, raw.toString('hex') + '.' + mime.extensions[file.mimetype]);
      });
    }
  })
  var upload = multer({storage: storage});

  route.get('/',function(req, res){
    res.render('./upload');
  })
  route.post('/', upload.single('userfile'), function(req, res){
    console.log(req.file);
    var sql = 'INSERT INTO tempImage SET ?';
    var createTime = new Date();
    var expiredTerm = 1*60*60*1000;
    var expiredTime = new Date(createTime.getTime()+expiredTerm);
    var tempImage = {
      filename: req.file.filename,
      createTime: createTime,
      expiredTime: expiredTime
    }
    conn.query(sql, tempImage, function(err, results){
      if(err){
        return res.status(500);
      } else if(results.affectedRows!=1){
        return res.status(404);
      } else {
        res.redirect('/view/' + results.insertId);
      }
    });
    //res.send('Uploaded : ' + req.file.filename);
    
  });

  return route;
}