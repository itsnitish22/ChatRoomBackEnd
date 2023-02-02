const app = require('./app/app.js') //app from app.js
const http = require('http'); //http
const server = http.createServer(app); //create server
const { Server } = require("socket.io"); //import socketio
const io = new Server(server); //creating io server
const PORT = process.env.PORT || 3000 //port if env.PORT is available otherwise 3000

var activeUsernames = {} //maintaining usernames
var activeRooms = [] //maintaining active rooms

//on new connections
io.on('connection', (socket) => {

    //broadcasting msg except itself
    socket.on('chat-message', (data) => {
        socket.broadcast.to(data.roomid).emit('chat-message', data.msg);
    });

    //create room event
    socket.on('create-room', (roomid) => {
        socket.rooms = roomid //create a room in socketio
        activeRooms.push(roomid) // add the room to activeRooms to maintain it
    })

    //when joining a room
    socket.on('join-room', (data) => { //data will have username, roomid, message
        if (activeRooms.includes(data.roomid)) { //chec if the room exist

            activeUsernames[data.username] = data.username //adding username to global username
            socket.username = data.username //store username in socket session for this client

            socket.join(data.roomid) //join the room
            socket.broadcast.to(data.roomid).emit('update-about-room', data.username + ' has connected to this room'); //broadcast msg to that room about the joining of new user
        }
    })

    //when user disconnects    
    socket.on('disconnect', (data) => { //data will have username, room id
        delete activeUsernames[socket.username] //deleting the disconnecting user from activeUsers

        socket.broadcast.to(data.roomid).emit('update-about-room', data.username + ' left this room this room'); //broadcast msg to that room about the leaving of new user

        socket.leave(data.roomid) //leaving the room
    })
});

//server start
server.listen(PORT, (err) => {
    if (err)
        console.log(`Error starting the server ${err}`)
    else
        console.log(`Server starting on PORT ${PORT}`);
});