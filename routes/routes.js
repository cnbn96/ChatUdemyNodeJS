var im = require('imagemagick');
module.exports = function(express, app, passport, config, mongoose, formidable, fs, os, knoxClient, io, gm){
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
    });
  });

  router.post('/messageUpload', function(req, res, next){
    function generateFileName(filename){
      var ext_regex = /(?:\.([^.]+))?$/;
      var ext = ext_regex.exec(filename)[1];
      var date = new Date().getTime();
      var charBlank = "abcdefghlijklmnopqrstuvwxyz";
      var fstring = '';
      for(var i = 0; i < 15; i++){
        fstring += charBlank[parseInt(Math.random()*26)];
      }
      return (fstring+date+"."+ext);
    }
    var tmpFile, nFile, fName, fSize, userId, roomId;
    var newForm = formidable.IncomingForm();
        newForm.keepExtensions = true;
        newForm.parse(req, function(err, fields, files){
          tmpFile = files.upload.path;
          fSize = files.upload.size;
          userId = fields.userId;
          roomId = fields.roomId;
          fName = generateFileName(files.upload.name);
          nFile =  os.tmpDir() + '/' + fName;

          fs.rename(tmpFile, nFile, function(){
            var stream = fs.createReadStream(nFile);
            var req = knoxClient.putStream(stream, fName, {
              'Content-type': 'image/jpeg',
              'Content-Length': fSize
            }, function(err, results){
              console.log(results);
            });
            req.on('response', function(resX){
              if(resX.statusCode == 200){
                console.log("Pushed Success!!!!!!!!");
                res.writeHead(200, {'Content-type': 'text/plain'});
                res.end(JSON.stringify({"imageURL": '<img src="'+ config.S3URL + fName +'">'}));
              }else{
                var err = new Error("Error" + resX.statusCode);
                err.status = resX.statusCode;
                next(err);
              }
            });
              // var stream = fs.createReadStream(nFile);
              // var req = knoxClient.putStream(stream, fName, {
              //   'Content-type': 'image/jpeg',
              //   'Content-Length': fSize
              // }, function(err, results){
              //   console.log(results);
              // });
              // req.on('response', function(resX){
              //   if(resX.statusCode == 200){
              //     console.log("Pushed Success!!!!!!!!");
              //     res.writeHead(200, {'Content-type': 'text/plain'});
              //     res.end(JSON.stringify({"FileName": fName}));
              //   }else{
              //     var err = new Error("Error" + resX.statusCode);
              //     err.status = resX.statusCode;
              //     next(err);
              //   }
              // });
          });
        });

        // newForm.on('end', function(){
        //   var stream = fs.createReadStream(tmpFile);
        //   var req = knoxClient.putStream(stream, fName, {
        //     'Content-type': 'image/jpeg',
        //     'Content-Length': fSize
        //   }, function(err, results){
        //     console.log(results);
        //   });
        //
        //   req.on('response', function(res){
        //     if(res.statusCode == 200){
        //       console.log("Pushed Success!!!!!!!!");
        //       // var src = "https://s3.amazonaws.com/chatcatstorage/"+ fName;
        //       // var message = '<img src="'+src+'">';
        //       // Message.createMessage(roomId, userId, message, function(err){
        //       //   if(err){
        //       //     console.log("ERR");
        //       //   }else{
        //       //     console.log("message update successful!");
        //       //   }
        //       // });
        //     }else{
        //       next(new HttpError(res.statusCode));
        //     }
        //   });
        // });
  });

  app.use('/', router);
}
