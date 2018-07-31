module.exports = function(conn){
  var path = require('path');
  var dir = path.join(__dirname, 'public');
  dir = path.join(dir, '../../../uploads');
  var route = require('express').Router();  
  var crypto = require('crypto');
  var mime = require('mime');
  var fs = require('fs');
  
  function createTempImage(conn, req, res, post, callback){
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
        callback(req.user, post, tempImage);
      }
    });
  }

  function viewPost(jade){
    return function(req, res){
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
                  createTempImage(conn, req, res, post, function(user, post, tempImage){
                    fs.readFile(path.join(dir, path.basename(post.filename, path.extname(post.filename)) + '/config.json'), function(err, data){
                      var multiResConfig = JSON.parse(data);
                      multiResConfig.basePath = '/images/' + tempImage.id + '/multires';
                      multiResConfig.autoLoad = true;
                      multiResConfig.author = user.displayName;
                      multiResConfig.title = post.title;
                      // delete multiResConfig.hfov;
                      res.render(jade, {
                        'post': post,
                        'tempImage': tempImage,
                        'user': user,
                        'multiResConfig': JSON.stringify(multiResConfig)
                      });
                    });                  
                  });
                } else {
                  fs.readFile(path.join(dir, path.basename(post.filename, path.extname(post.filename)) + '/config.json'), function(err, data){
                    var multiResConfig = JSON.parse(data);
                    multiResConfig.basePath = '/images/' + tempImage.id + '/multires';
                    multiResConfig.autoLoad = true;
                    multiResConfig.author = req.user.displayName;
                    multiResConfig.title = post.title;
                    // delete multiResConfig.hfov;
                    res.render(jade, {
                      'post': post,
                      'tempImage': tempImage,
                      'user': req.user,
                      'multiResConfig': JSON.stringify(multiResConfig)
                    });
                  });   
                }
              }
            })
          } else {
            createTempImage(conn, req, res, post, function(user, post, tempImage){
              fs.readFile(path.join(dir, path.basename(post.filename, path.extname(post.filename)) + '/config.json'), function(err, data){
                var multiResConfig = JSON.parse(data);
                multiResConfig.basePath = '/images/' + tempImage.id + '/multires';
                multiResConfig.autoLoad = true;
                multiResConfig.author = user.displayName;
                multiResConfig.title = post.title;
                // delete multiResConfig.hfov;
                res.render(jade, {
                  'post': post,
                  'tempImage': tempImage,
                  'user': user,
                  'multiResConfig': JSON.stringify(multiResConfig)
                });
              });   
            });
          }
        }
      })
    };
  }
  route.get('/:id', viewPost('./post/view'));
  route.get('/:id/edit', viewPost('./post/edit'))
  route.post('/:id/edit', function(req, res){
    var update = {
      title: req.body.title,
      description: req.body.description
    };
    var sql = 'UPDATE post SET ? WHERE id=?';
    conn.query(sql, [update, req.params.id], function(err, results){
      if(err){
        res.status(500);
      } else if(results.affectedRows != 1) {
        res.status(500);
      } else {
        return res.redirect('/post/' + req.params.id);
      }
    })
  })
  return route;
}