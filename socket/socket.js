module.exports = function(io, mongoose , config){
  var Room = require('../db/dbSchema/roomSchema.js'),
      Message = require('../db/dbSchema/messageSchema.js');
  //Create a rooms array variable and get all roomList on db
  //push in rooms
  var rooms = new Array();
  Room.roomList(function(err, roomsList){
    if(err){
    console.log("ERROR");
    return;
    }
    Array.prototype.push.apply(rooms, roomsList);
  });
  var chatrooms = io.of('/roomlist').on('connection', function(socket){
    console.log('Connection Established on the Server!');

    socket.broadcast.emit('roomupdate', JSON.stringify(rooms));
    socket.emit('roomupdate', JSON.stringify(rooms));
    socket.on('newroom', function(data){
      Room.createRoom(data.room_number, data.room_name, function(err, newRoom){
        if(err){
          console.log("ERROR");
        }
        rooms.push(newRoom);
        socket.broadcast.emit('roomupdate', JSON.stringify(rooms));
        socket.emit('roomupdate', JSON.stringify(rooms));
        console.log("Create room successful!");
      });
      // setTimeout(function(){
      //   socket.broadcast.emit('roomupdate', JSON.stringify(rooms));
      //   socket.emit('roomupdate', JSON.stringify(rooms));
      // },500);
    });
  });


  var messages = io.of('/messages').on('connection', function(socket){
    console.log('Connection Message Established on the Server');
    //socket.broadcast.to(data.room.roomNumber).emit('messageFeed', JSON.stringify(data));

    socket.on('joinroom', function(data){
      socket.userPic = data.userPic;
      socket.userName = data.userName;
      socket.join(data.room);
      Message.getAllPopulatedMessagesByRoomId(data.roomId, function(err, messages){
        if(messages){
          //socket.broadcast.to(data.room).emit('getMessagesHistory', JSON.stringify(messages));
          socket.emit('getMessagesHistory', JSON.stringify(messages));
        }
      });
      updateUserList(data.room, true);
    });

    // socket.once('disconnect', function(){
    //   socket.on('outroom', function(data){
    //     updateUserList(data.room, true);
    //   })
    // })
    socket.on('getMoreMessages', function(data){
      Message.getMoreMessages(data.roomId, data.offset, function(messages){
        socket.emit('getMessagesHistory', JSON.stringify(messages.docs));
      })
    })
    socket.on('newMessage', function(data){
      Message.createMessage(data.room.roomId, data.user.userId, data.message, function(err){
        if(err){
          console.log("ERROR");
        }
        console.log("message update successful!");
      });
      socket.broadcast.to(data.room.roomNumber).emit('messageFeed', JSON.stringify(data));
    })
    socket.on('typingMessage', function(data){
      socket.broadcast.to(data.room).emit('typingFeed', JSON.stringify(data));
    });
    function updateUserList(room, updateAll){
        var getAllUsers = io.of('/messages').clients(room);
        var userList = [];
        for(var i in getAllUsers){
          userList.push({userName: getAllUsers[i].userName, userPic: getAllUsers[i].userPic});
        }
        socket.to(room).emit('updateUserList', JSON.stringify(userList));
        if(updateAll){
          socket.broadcast.to(room).emit('updateUserList', JSON.stringify(userList));
        }
    }

    socket.on('updateList' , function(data){
      updateUserList(data.room);
    });

  })

}
