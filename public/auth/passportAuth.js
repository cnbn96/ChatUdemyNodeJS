module.exports = function(passport, FacebookStrategy, config, mongoose){
  var chatUser = new mongoose.Schema({
    profileID: String,
    fullName : String,
    profileAvatar: String
  });

  var userModel = mongoose.model('chatUser', chatUser);
  passport.serializeUser(function(user,done){
    done(null, user.id)
  });
  passport.deserializeUser(function(id, done){
    userModel.findById(id, function(err,user){
      done(err, user);
    });
  });

  passport.use(new FacebookStrategy({
    clientID: config.fb.appID,
    clientSecret: config.fb.appSecret,
    callbackURL : config.fb.callbackURL,
    profileFields: ['id', 'displayName', 'photos']
  }, function(accessToken, refreshToken, profile, done){
    //Check if the user exists in our mongodb
    //If not, create a new one and return the profile
    //If the user exists, simly return the profile

    userModel.findOne({'profileID': profile.id}, function(err,result){
      if(result){
        done(null, result);
      }else{
        var newChatUser = new userModel({
          profileID: profile.id,
          fullName: profile.displayName,
          profileAvatar: profile.photos[0].value || ''
        });
        newChatUser.save(function(err){
          done(null, newChatUser);
        });
      }
    });
  }));
}
