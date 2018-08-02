module.exports = function(app)
{   
  const User = require('./models/user').model;
  // GET ALL users
  app.get('/api/users', function(req,res){
      User.find(function(err, users){
          if(err) return res.status(500).send({error: 'database failure'});
          res.json(users);
      })
  });

  // GET SINGLE user
  app.get('/api/users/:user_id', function(req, res){
      User.findOne({_id: req.params.user_id}, function(err, user){
          if(err) return res.status(500).json({error: err});
          if(!user) return res.status(404).json({error: 'user not found'});
          res.json(user);
      })
  });

  // GET user BY AUTHOR
  app.get('/api/users/author/:author', function(req, res){
      User.find({author: req.params.author}, {_id: 0, title: 1, published_date: 1},  function(err, users){
          if(err) return res.status(500).json({error: err});
          if(users.length === 0) return res.status(404).json({error: 'user not found'});
          res.json(users);
      })
  });

  // CREATE user
  app.post('/api/users', function(req, res){
    var user = new User();
    user.displayName = req.body.displayName;
    user.email = req.body.email;

    user.save()
      .then((savedUser) =>{
        console.log(savedUser);
      })
      .catch((err)=>{
        console.log(err);
      })
    
    // function(err){
    //     if(err){
    //         console.error(err);
    //         res.json({result: 0});
    //         return;
    //     }

    //     res.json({result: 1});

    // });
  });

  // UPDATE THE user
  app.put('/api/users/:user_id', function(req, res){
      User.update({ _id: req.params.user_id }, { $set: req.body }, function(err, output){
          if(err) res.status(500).json({ error: 'database failure' });
          console.log(output);
          if(!output.n) return res.status(404).json({ error: 'user not found' });
          res.json( { message: 'user updated' } );
      })
  /* [ ANOTHER WAY TO UPDATE THE user ]
          user.findById(req.params.user_id, function(err, user){
          if(err) return res.status(500).json({ error: 'database failure' });
          if(!user) return res.status(404).json({ error: 'user not found' });
          if(req.body.title) user.title = req.body.title;
          if(req.body.author) user.author = req.body.author;
          if(req.body.published_date) user.published_date = req.body.published_date;
          user.save(function(err){
              if(err) res.status(500).json({error: 'failed to update'});
              res.json({message: 'user updated'});
          });
      });
  */
  });

  // DELETE user
  app.delete('/api/users/:user_id', function(req, res){
      User.remove({ _id: req.params.user_id }, function(err, output){
          if(err) return res.status(500).json({ error: "database failure" });

          /* ( SINCE DELETE OPERATION IS IDEMPOTENT, NO NEED TO SPECIFY )
          if(!output.result.n) return res.status(404).json({ error: "user not found" });
          res.json({ message: "user deleted" });
          */

          res.status(204).end();
      })
  });
     
}