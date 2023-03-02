const path = require('path');
const http = require('http')
const express = require('express');
const socketio = require('socket.io');
const { Socket } = require('engine.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express(); 
const server = http.createServer(app);
const io = socketio(server);

// Public static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'dreamybull';

// Server run when client connects 
io.on('connection', socket => {
    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);
        
          // Welcome screen
    socket.emit('message', formatMessage (botName, 'Welcome to CCT CHAT!'));

    // connection message 
    socket.broadcast.to(user.room)
    .emit(
         'message', 
    formatMessage (botName, `${user.username} has joined the chat`));

    // Send User Room info 
    io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
    });
    
    });

   //listen for chat message
   socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username,msg));
    });

    // disconnection message 
    socket.on('disconnect', () => {
        const user = userLeave(socket.id); 

        if(user){
            io.to(user.room).emit('message', formatMessage (botName,`${user.username} has left the chat`));

            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }

    });

}); 

const PORT = 3000 || process.env.PORT; 

server.listen(PORT, () => console.log(`server running on port ${PORT}`));

