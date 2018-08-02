const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mime = require('mime');
const permissionSchema = require('./permission').schema;

var tempImageSchema = new Schema({
  imageId:{
    type: String,
    alias: 'onlyname'
  },
  extension: String,
  // type: String, //virtual
  permission: permissionSchema,
  createdTime: {
    type: Date, expires: 3600,
    default: Date.now
  },
  // expiredTime: Date,
})
tempImageSchema.virtual('type')
.get(function(){
  return mime.getType(this.extension);
})
.set(function(v){
  this.extension = mime.getExtension(v);
})
tempImageSchema.virtual('expiredTime')
.get(function(){
  return new Date(this.createdTime.getTime()+1*3600*1000);
})

module.exports = {
  model: mongoose.model('TempImage', tempImageSchema),
  schema: tempImageSchema
};