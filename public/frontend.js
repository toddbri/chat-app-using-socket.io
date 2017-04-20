$(function () {
  console.log("loaded");
  var username ='' ;
  while (username === ''){
      username = prompt("what is your name?");

  }

  var socket = io();
  socket.emit('login',username);

  $('body').keyup(function(){
    socket.emit('typing','');
  });

  socket.on('typing',function(message){
    $('#typingmessage').text(message);
  });

  $('form').submit(function(){
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  });
  socket.on('chat message', function(data){
    var message = data.username + " says: " + data.message;
  $('#messages').append($('<li>').text(message).css('color', data.color));
  });

  socket.on('newuser', function(message){
    $('#messages').append($('<li>').text(message).css({'color':'red','font-weight': 'bold'}));
  });

  socket.on('updateuserlist',function(usernames){
    console.log("in updateuserlist");
      $('#users').empty();
      $('#users').append($('<li>').text('ACTIVE USERS'));
      $.each(usernames, function(index,value){
        $('#users').append($('<li>').text(value));
        console.log('u: ' + value + ", " + index);
        $('#users li:nth-child('+1+')').contextmenu(function(){
          console.log("you right clicked?");
        });
      });
  });
});
