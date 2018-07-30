module.exports = function(conn){
  var exec = require('child_process').exec;
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
    res.render('./upload', {user: req.user});
  })
  route.post('/', upload.single('userfile'), function(req, res){
    console.log(req.file);
    var tempPost = {
      title: "",
      description: "",
      filename: req.file.filename,
      createTime: new Date(),
      userid: req.user.id,
      permission: 'temp',
      tempImageId: null
    }
    exec('python generate.py ../../uploads/' 
      + req.file.filename 
      + ' -n "C:/program Files/Hugin/bin/nona.exe"'
      + ' -o ../../uploads/'
      + req.file.filename.replace("." + mime.getExtension(req.file.mimetype), "")
      + '/ >> log.log',{
        'encoding': 'euc-kr'
      }, function(err, stdout, stderr){
        if(err){
          return res.status(500);
        } else {
          var sql = 'INSERT INTO post SET ?';
          conn.query(sql, tempPost, function(err, results){
            if(err){
              return res.status(500);
            } else if(results.affectedRows!=1){
              return res.status(404);
            } else {
              tempPost.id = results.insertId;
              res.redirect('/post/' + results.insertId + '/edit');
            }
          });
        }
      }
    );
  });
  return route;
}