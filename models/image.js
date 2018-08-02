const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const path = require('path');
const mime = require('mime');

var imageSchema = new Schema({
  imageType: String,
  imageId: {
    type: String,
    alias: 'single.onlyname'
  },
  extension: {
    type: String,
    alias: 'single.extname'
  },
  // type: { // virtual
  //   type: String,
  //   alias: 'single.type'
  // },
  // single: { // alias from imageId, extension, type
  //   onlyname: String, 
  //   extname: String,
  //   type: String,
  //   basename: String, // virtual
  // },
  imgurURL: String,
  multires: [{
    res: Number,
    extension: String,
    type: String
  }],
  cluster: {
    hfov: Number,
    extension: String,
    tileResolution: Number,
    maxLevel: Number,
    cubeResolution: Number
  },
  tempImageInfo: {
    tempImageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TempImage'
    },
    createdTime: Date,
    expiredTime: Date, //virtual
    renewalTime: Date, //virtual
  }
})
imageSchema.virtual('single.basename')
.get(function(){
  return this.onlyname + '.' + this.extname;
})
.set(function(v){
  this.extname = path.extname(v);
  this.onlyname = path.basename(v, this.extname);
});
imageSchema.virtual('tempImage.expiredTime')
.get(function(){
  return new Date(this.createdDate.getTime()+1*3600*1000);
});
imageSchema.virtual('tempImage.renewalTime')
.get(function(){
  return new Date(this.createdDate.getTime()+1800*1000);
});
imageSchema.virtual('type')
.get(function(){
  return mime.getType(this.extension);
})
.set(function(v){
  this.extension = mime.getExtension(v);
});

module.exports = {
  model: mongoose.model('Image', imageSchema),
  schema: imageSchema
};