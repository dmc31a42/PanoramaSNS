const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var userSchema = new Schema({
  displayName: String,
  email: String,
  local: {
    id: String,
    password: String,
    salt: String    
  },
  facebook: {
    id: String,
    accessToken: String,
  },
  google: {
    id: String,
    accessToken: String,
  },
  twitter: {
    id: String,
    accessToken: String,
  },
  kakao: {
    id: String,
    accessToken: String,
  },
  createdTime: {
    type: Date,
    default: Date.now
  },
});

module.exports = {
  model: mongoose.model('User', userSchema),
  schema: userSchema
};

