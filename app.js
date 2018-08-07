// var app = require('./config/mysql/express')();
// var conn = require('./config/mysql/db')();
// var passport = require('./config/mysql/passport')(app, conn);

// var route_app = require('./routes/mysql/auth')(passport, conn);
// app.use('/auth/',route_app);
// var route_topic = require('./routes/mysql/topic')(conn);
// app.use('/topic',route_topic);
// var route_profile = require('./routes/mysql/profile')();
// app.use('/profile', route_profile);
// var route_upload = require('./routes/mysql/upload')(conn);
// app.use('/upload', route_upload);
// var route_view = require('./routes/mysql/images')(conn);
// app.use('/images', route_view);
// var route_post = require('./routes/mysql/post')(conn);
// app.use('/post', route_post);
// var route_share = require('./routes/mysql/share')(conn);
// app.use('/s', route_share);
// app.listen(3000, function(){
//   console.log('Connected, 3000 port!');
// })

const SERVER_CONFIG = require('./config/MongoDB/config.json');
const app = require('./config/MongoDB/express')();
const db = require('./config/MongoDB/db')();
const passport = require('./config/MongoDB/passport')(app);

var route_auth = require('./routes/MongoDB/auth')(passport);
app.use('/auth/', route_auth);
var route_profile = require('./routes/MongoDB/profile')();
app.use('/profile/', route_profile);
app.listen(SERVER_CONFIG.HOST.port, function(){
  console.log('Connected, ' + SERVER_CONFIG.HOST.port + ' port!');
})
