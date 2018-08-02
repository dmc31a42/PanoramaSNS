const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const permissionSchema = require('./permission').schema;

var postSchema = new Schema({
  postId: Number,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: String,
  description: String,
  defaultImage: String,
  images: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image'
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

module.exports = {
  model: mongoose.model('Post', postSchema),
  schema: postSchema
};