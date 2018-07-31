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

var postSchema = new Schema({
  postId: Number,
  title: String,
  description: String,
  imageType: 
})



