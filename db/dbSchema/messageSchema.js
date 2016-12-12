var mongoose = require("mongoose");
var mongoosePaginate = require('mongoose-paginate');

var db = mongoose.connection;

var MessageSchema = new mongoose.Schema({
  room_id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room'
  },
  chatUser_id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'chatUser'
  },
  message: String
});
MessageSchema.plugin(mongoosePaginate);

var Message = module.exports = mongoose.model("Message", MessageSchema);



module.exports.messageList = function(callback) {
  Message.find({}, function(err, messages) {
    callback(err, messages);
  });
}

module.exports.populatedList = function(callback) {
  Message.find({}).populate('').exec(function(err, messages) {
    callback(err, messages);
  })
}

module.exports.getAllMessagesByRoomId = function(roomId, callback) {
  Message.find({'room_id': roomId},function(err, messages) {
    callback(err, messages);
  });
}

module.exports.populatedMessageUser = function(messageId,callback){
  Message.findOne({_id: messageId}).populate('chatUser_id').exec(function(err, message){
    callback(err, message);
  });
}
module.exports.getAllPopulatedMessagesByRoomId = function(roomId,callback){
  Message.find({'room_id': roomId}).sort([['_id', -1]]).limit(5).populate('chatUser_id room_id').exec(function(err, messages){
    callback(err, messages);
  });
}

module.exports.getMoreMessages = function(roomId, offset, callback){
  var query = {'room_id': roomId};
  var options = {
    sort: { '_id': -1 },
    populate: 'chatUser_id room_id',
    offset: offset * 10 + 5, 
    limit: 10
  };
  Message.paginate(query, options).then(function(result){
    callback(result);
  })
}

module.exports.getMessageById = function(id, callback) {
  Message.findById(function(err, message) {
    callback(err, message);
  });
}

module.exports.deleteMessageId = function(id, callback) {
  Message.remove({_id: id}, function(err) {
    callback(err);
  })
}

module.exports.createMessage = function(roomId, chatUserId, message, callback) {
  var newMessage = new Message({
    room_id: roomId,
    chatUser_id: chatUserId,
    message: message
  });
  newMessage.save();
}