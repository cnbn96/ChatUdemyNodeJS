var express = require('express'),
    app = express(),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    config = require('./config/config.js'),
    ConnectMongo = require('connect-mongo')(session),
    mongoose = require('mongoose').connect(config.dbUrl),
    passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    knox = require('knox'),
    formidable = require('formidable'),
    fs = require('fs'),
    os = require('os'),
    gm = require('gm');


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

knoxClient = knox.createClient({
  key: config.S3AccessKey,
  secret: config.S3Secret,
  bucket: config.S3Bucket
});
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
io.configure(function () {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});
require('./socket/socket.js')(io, mongoose, config);

app.use(passport.initialize());
app.use(passport.session());
require('./auth/passportAuth.js')(passport, FacebookStrategy, config, mongoose);
require('./routes/routes.js')(express, app, passport, config, mongoose, formidable, fs, os, knoxClient, io, gm);

app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// app.listen(3001, function(){
//   console.log('MyChatCat working on port 3001');
//   console.log('Mode: '+env);
// });
app.set('port', process.env.PORT || '3001');



server.listen(app.get('port'), function(){
  console.log("App working on PORT: "+app.get('port'));
  console.log('Mode: '+env);
});
