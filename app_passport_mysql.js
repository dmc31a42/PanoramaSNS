var app = require('./config/mysql/express')();
var conn = require('./config/mysql/db')();
var passport = require('./config/mysql/passport')(app, conn);

app.get('/welcome', function(req, res){
  if(req.user && req.user.displayName) {
    res.send(`
      <h1>Hello, ${req.user.displayName}</h1>
      <a href="/auth/logout">logout</a>
    `);
  } else {
    res.send(`
      <h1>Welcome</h1>
      <ul>
        <li><a href="/auth/login">Login</a></li>
        <li><a href="/auth/register">Register</a></li>
      </ul>
    `);
  }
});
app.get('/count', function(req, res){
  if(req.session.count) {
    req.session.count++;
  } else {
    req.session.count = 1;
  }
  res.send('count : '+req.session.count);
});


var route_app = require('./routes/mysql/auth')(passport, conn);
app.use('/auth/',route_app);
app.listen(3003, function(){
  console.log('Connected 3003 port!!!');
});
