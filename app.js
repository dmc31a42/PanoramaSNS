var app = require('./config/mysql/express')();
var conn = require('./config/mysql/db')();
var passport = require('./config/mysql/passport')(app, conn);

var route_app = require('./routes/mysql/auth')(passport, conn);
app.use('/auth/',route_app);
var route_topic = require('./routes/mysql/topic')(conn);
app.use('/topic',route_topic);
var route_profile = require('./routes/mysql/profile')();
app.use('/profile', route_profile);
app.listen(3000, function(){
  console.log('Connected, 3000 port!');
})
