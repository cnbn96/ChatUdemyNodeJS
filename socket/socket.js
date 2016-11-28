module.exports = function(io, rooms){
  var chatrooms = io.of('/roomlist').on('connection', function(socket){
    console.log('Connection Established on the Server!');
  });

}
