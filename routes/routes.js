module.exports = function(express, app, passport, config, rooms){
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
    res.render('chatrooms', {title: 'Welcome ', user: req.user, config: config});
  });
  router.get('/room/:id', securePages ,function(req, res, next){
    var roomNumber = req.params.id;
    findRoomTitle(roomNumber);
    var room = {roomNum: roomNumber, roomName: findRoomTitle(roomNumber)};
    res.render('room', {
                          title:'Welcome to MyChatCat Room',
                          user: req.user,
                          room: room,
                          config: config});
  });

  router.get('/*', function(req, res, next){
    var err = new Error('Not Found');
    err.status = 404;
    res.render(err);
  });

  function findRoomTitle(roomID){
    var n = 0;
    while(n < rooms.length){
      console.log(rooms[n].room_number, rooms[n].room_name)
      if(rooms[n].room_number == roomID){
        return rooms[n].room_name;
      }else{
        n++;
        continue;
      }
    }
  }
  app.use('/', router);
}
