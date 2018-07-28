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
    //res.send('Uploaded : ' + req.file.filename);
    
  });

  return route;
}