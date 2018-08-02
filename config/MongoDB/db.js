const mongoose = require('mongoose');
const SERVER_CONFIG = require('./config.json');
module.exports = () => {
  function connect() {
    mongoose.connect(SERVER_CONFIG.MongoDB.URL, SERVER_CONFIG.MongoDB.options, function(err) {
      if (err) {
        console.error('mongodb connection error', err);
      }
      console.log('mongodb connected');
    });
  }
  connect();
  mongoose.connection.on('disconnected', connect);
};