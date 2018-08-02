const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

module.exports = {
  //model: mongoose.model('TempImage', permissionSchema),
  schema: permissionSchema
};