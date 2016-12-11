var express = require('express'),
    app = express(),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    expressValidator = require('express-validator'),
    session = require('express-session'),
    config = require('./config/config.js'),
    ConnectMongo = require('connect-mongo')(session),
    mongoose = require('mongoose').connect(config.dbUrl),
    passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    rooms = [];
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(expressValidator());

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
//Initialize passport and use the session of passport
app.use(passport.initialize());
app.use(passport.session());

//initialize passport and
require('./auth/passportAuth.js')(passport, FacebookStrategy, config, mongoose);
require('./routes/routes.js')(express, app, passport, config, rooms);
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

var server = require('http').createServer(app);

var io = require('socket.io').listen(server);
io.configure(function () {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});
require('./socket/socket.js')(io, rooms);

server.listen(app.get('port'), function(){
  console.log("App working on PORT: "+app.get('port'));
  console.log('Mode: '+ env);
});
