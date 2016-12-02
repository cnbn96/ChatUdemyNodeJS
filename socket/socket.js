module.exports = function(io, rooms){
  var chatrooms = io.of('/roomlist').on('connection', function(socket){
    console.log('Connection Established on the Server!');
    socket.on('newroom', function(data){
      rooms.push(data);
      socket.broadcast.emit('roomupdate', JSON.stringify(rooms));
      socket.emit('roomupdate', JSON.stringify(rooms));
    })
    socket.broadcast.emit('roomupdate', JSON.stringify(rooms));
    socket.emit('roomupdate', JSON.stringify(rooms));
  });


  var messages = io.of('/messages').on('connection', function(socket){
    console.log('Connection Message Established on the Server');
    socket.on('joinroom', function(data){
      socket.userPic = data.userPic;
      socket.userName = data.userName;
      socket.join(data.room.roomNum);
      updateUserList(data.room.roomNum, true);
    });

    socket.on('newMessage', function(data){
      socket.broadcast.to(data.room.roomNum).emit('messageFeed', JSON.stringify(data));
    })

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
      updateUserList(data.room.roomNum);
    });

  })

}
