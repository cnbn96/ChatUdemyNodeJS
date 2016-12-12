var mongoose = require("mongoose");
var db = mongoose.connection;
var RoomSchema = new mongoose.Schema({
    roomNumber: Number,
    roomName: String
});
var Room = module.exports = mongoose.model("Room", RoomSchema);

module.exports.roomList = function(callback) {
  Room.find({}, function(err, rooms) {
    callback(err, rooms);
  });
}
module.exports.getRoomById = function(id, callback) {
  Room.findById(function(err, message) {
    callback(err, message);
  });
}

module.exports.deleteRoomId = function(id, callback) {
  Room.remove({_id: id}, function(err) {
    callback(err);
  })
}

// By roomNumber
module.exports.getRoomByRoomNumber = function(roomNumber, callback) {
  Room.findOne({'roomNumber': roomNumber}, function(err, room) {
    callback(err, room);
  });
}

module.exports.updateRoomByRoomNumber = function(roomNumber, roomName, callback) {
  Room.update({'roomNumber': roomNumber}, {roomName: roomName}, {}, function(err) {
    callback(err);
  })
}

module.exports.deleteRoomNumber = function(roomNumber, callback) {
  Room.remove({'roomNumber': roomNumber}, function(err) {
    callback(err);
  })
}

module.exports.createRoom = function(roomNum, roomName, callback) {
  var newRoom= new Room({
    roomNumber: roomNum,
    roomName: roomName
  });
  newRoom.save(function(err){
    callback(err, newRoom);
  });
}
