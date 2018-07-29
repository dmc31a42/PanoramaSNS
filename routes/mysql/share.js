module.exports = function(conn){
  var path = require('path');
  var dir = path.join(__dirname, 'public');
  dir = path.join(dir, '../../../uploads');
  var route = require('express').Router();  
  var crypto = require('crypto');
  var mime = require('mime');

  function createTempImage(conn, req, res, post){
    var now = new Date();
    var sql = 'INSERT INTO tempImage SET ?';
    tempImage = {
      filename: post.filename,
      createTime: now,
      expiredTime: new Date(now.getTime() + 1*60*60*1000)
    };
    conn.query(sql, tempImage, function(err, results){
      if(err){
        res.status(500);
      } else if(results.affectedRows!=1){
        return res.status(404);
      } else {
        tempImage.id = results.insertId;
        post.tempImageId = tempImage.id;
        conn.query('UPDATE post SET ? WHERE id=?',[post, post.id]);
        res.render('./post/edit', {
          'post': post,
          'tempImage': tempImage,
          'user': req.user
        });
      }
    });
  }

  route.get('/:id', function(req, res){
    var sql = 'SELECT * from post WHERE id=?';
    conn.query(sql, req.params.id, function(err, results){
      console.log(results);
      if(err){
        res.status(500);
      } else if (results.length != 1){
        res.status(500);
      } else {
        var post = results[0];
        if(post.tempImageId) {
          var sql = 'SELECT * from tempImage WHERE id=?';
          conn.query(sql, post.tempImageId, function(err, results) {
            if(err){
              res.status(500);
            } else if(results.length != 1){
              createTempImage(conn, req, res, post);
            } else {
              var tempImage = results[0];
              var now = new Date();
              if(tempImage.expiredTime.getTime() - now.getTime() - 10*60*1000 < 0){
                conn.query('DELETE from tempImage WHERE id=?', tempImage.id);
                createTempImage(conn, req, res, post);
              } else {
                res.render('./share', {
                  'post': post,
                  'tempImage': tempImage,
                  'user': req.user
                });
              }
            }
          })
        } else {
          createTempImage(conn, req, res, post);
        }
      }
    })
  })
  return route;
}