var express = require('express'),
    app = express(),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    config = require('./config/config.js'),
    ConnectMongo = require('connect-mongo')(session),
    mongoose = require('mongoose').connect(config.dbUrl),
    passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy;

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
var env = process.env.NODE_ENV || 'development';
if(env === 'development'){
  app.use(session({secret: config.sessionSecret}))
}else{
  app.use(session({
    secret: config.sessionSecret,
    store: new ConnectMongo({
      url: config.dbUrl,
      stringify: true
    })
  }))
}

app.use(passport.initialize());
app.use(passport.session());

require('./auth/passportAuth.js')(passport, FacebookStrategy, config, mongoose);
require('./routes/routes.js')(express, app, passport);


app.listen(3001, function(){
  console.log('MyChatCat working on port 3001');
  console.log('Mode: '+env);
});
