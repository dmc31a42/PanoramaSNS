module.exports = function(){
  var fs = require('fs');
  var contents = fs.readFileSync('./config/mysql/config.json');
  var SERVER_CONFIG = JSON.parse(contents);
  var mysql = require('mysql');
  var conn = mysql.createConnection(SERVER_CONFIG.MYSQL.ConnectionFlags);
  conn.connect();
  return conn;
}
