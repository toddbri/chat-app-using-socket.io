/* jshint esversion: 6 */
const express = require('express');
const app = express();
var http = require('http').Server(app);
const session = require('express-session');
var secrets = require('./config/secret.js');
var users = {};

app.use(session({
  secret: secrets.secret,
  cookie: {maxAge: 1000000}
}));

app.use((req,resp,next) => {
  resp.locals.session = req.session;
  next();
});

var colorlist = ['aqua', 'blue','brown','chartreuse',
'coral','crimson','darkgreen','darkmagenta','darkolivegreen',
'darkturquoise','darkviolet','gold','indigo','lightblue',
'lime','orangered','peru','tomato','violet'];


app.use((req,resp,next) => {
  next();
});

app.use(express.static('public'));

app.use((req,resp,next) => {
  if (req.session.username) {
    next();
  }

});

var io = require('socket.io')(http);
io.on('connection', function(socket){

  console.log('a user connected');
  console.log(socket.id);
  socket.on('login', function(username){
    if (username != 'undefined' && username != 'null' && username !=='' && username !== null){
      socket.username = username;
      socket.color = pickAColor();
      console.log(socket.username, socket.color);
      var message = username + " has signed in...";
      message = message.toUpperCase();
      console.log('newuser message: ' + message);
      io.emit('newuser',message);
      users[socket.id]=username;
      updateuserlist();

    } else {
      socket.emit('chat message',{username: '', color: 'red', message: 'you must refresh and enter a valid username'});
      setTimeout(function(){socket.disconnect(true);},2000);
    }

  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
    var message = socket.username + " has left...";
    message = message.toUpperCase();
    console.log('user disconnet message: ' + message);
    if (socket.username !== undefined){
      io.emit('newuser',message);
      updateuserlist();
    }

  });
  socket.on('typing', function(){
    io.emit('typing',socket.username + ' is typing a message');
  });

  socket.on('chat message', function(msg){
    if (socket.username !=='undefined'){
      console.log('message: ' + msg);
      data = {username: socket.username, color: socket.color, message: msg};
      io.emit('chat message', data);
    }

  });
});

setInterval(function(){
  io.emit('typing','');
},1700);

var port = 5004;
http.listen(port, function(){
  console.log('listening on port: ' + port);
});

function pickAColor(){
  var num = parseInt(Math.random() * colorlist.length);
  return colorlist[num];
}
function updateuserlist(){
  console.log("clients: " + users);
  var usernames= [];
  var sessionIDs = Object.keys(io.sockets.sockets);
  Object.keys(users).forEach(function(key){
    console.log(key, users[key]);
    if (sessionIDs.indexOf(key) > -1 ){
      usernames.push(users[key]);
    }

  });
  io.emit('updateuserlist',usernames);
}
