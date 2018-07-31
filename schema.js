var path = require('path');
const mongoose = require('mongoose');

var localSchema = new Schema({
  id: String,
  password: String,
  salt: String    
});

var facebookSchema = new Schema({
  id: String,
  accessToken: String,
});

var googleSchema = new Schema({
  id: String,
  accessToken: String,
});

var twitterSchema = new Schema({
  id: String,
  accessToken: String,
})

var kakaoSchema = new Schema({
  id: String,
  accessToken: String,
})

var usersSchema = new Schema({
  displayName: String,
  email: String,
  local: localSchema,
  facebook: facebookSchema,
  google: googleSchema,
  twiiter: twitterSchema,
  kakao: kakaoSchema
});

// var imageFileSchema = new Schema({
//   onlyname: String,
//   extname: String,
//   // htmltype: String,
//   tempImageId: String
// });

// imageFileSchema.virtual('basename')
// .get(function(){
//   return this.onlyname + '.' + this.extname;
// })
// .set(function(v){
//   this.extname = path.extname(v);
//   this.onlyname = path.basename(v, this.extname);
// })

var permissionRulesSchema = new Schema({
  userIds: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'users',
  }],
  // groupIds: [{
  //   type: mongoose.Schema.Types.ObjectId, 
  //   ref: 'users',
  // }],
});

var permissionSchema = new Schema({
  allow: [String],
  deny: [String],
  allowRules: permissionRulesSchema,
  denyRules: permissionRulesSchema,
})

var tempImagesSchema = new Schema({
  image: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'images'
  },
  permission: permissionSchema,
  createdTime: {
    type: Date, expires: 3600,
    default: Date.now
  },
  expiredTime: Date,
})

var imagesSchema = new Schema({
  imageType: String,
  imageId: {
    type: String,
    alias: 'single.onlyname'
  },
  extension: {
    type: String,
    alias: 'single.extname'
  },
  type: {
    type: String,
    alias: 'single.type'
  },
  // single: { // alias from imageId, extension, type
  //   onlyname: String, 
  //   extname: String,
  //   type: String,
  //   basename: String, // virtual
  // },
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
  tempImageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'tempImages'
  },
  tempImageExpiredTime: Date,
  tempImageRenewalTime: Date,
})
imagesSchema.virtual('single.basename')
.get(function(){
  return this.onlyname + '.' + this.extname;
})
.set(function(v){
  this.extname = path.extname(v);
  this.onlyname = path.basename(v, this.extname);
})

var postsSchema = new Schema({
  postId: Number,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  title: String,
  description: String,
  defaultImage: String,
  images: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'images'
  }],
  createdDate: {
    type: Date,
    default: Date.now
  },
  modifiedDate: {
    type: Date,
    default: Date.now
  },
  permission: permissionSchema
})



