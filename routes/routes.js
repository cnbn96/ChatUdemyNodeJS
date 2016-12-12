
module.exports = function(express, app, passport, config, mongoose){
  var Room = require('../db/dbSchema/roomSchema.js'),
      Message = require('../db/dbSchema/messageSchema.js');
      // Message = require('../db/dbSchema/messageSchema.js')(mongoose, config);
  var router = express.Router();

  router.get('/',function(req, res, next){
    res.render('index', {title: 'Welcome to MyChatCat'});
  })
  function securePages(req, res, next){
    if(req.isAuthenticated()){
      next();
    }else{
      res.redirect('/');
    }
  }
  router.get('/auth/facebook', passport.authenticate('facebook'));

  router.get('/auth/facebook/callback', passport.authenticate('facebook',{
    successRedirect: '/chatrooms',
    failureRedirect: '/'
  }));

  router.get('/logout', function(req, res, next){
    req.logout();
    res.redirect('/');
  })
  router.get('/chatrooms', securePages ,function(req, res, next){
    Room.roomList(function(err, rooms){
      if(err){
        console.log("ERROR");
        res.status(404);
        return;
      }
      res.render('chatrooms', { title: 'Welcome ', 
                                user: req.user, 
                                config: config});
    });
    
  });
  router.get('/room/:id', securePages ,function(req, res, next){
    var roomNumber = req.params.id;
    Room.getRoomByRoomNumber(roomNumber, function(err, room){
      if(room === null || room === undefined){
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
        return;
      }
      res.render('room', {title:'Welcome to MyChatCat Room',
                                user: req.user,
                                room: room,
                                config: config});
    })
  });
  app.use('/', router);
}
