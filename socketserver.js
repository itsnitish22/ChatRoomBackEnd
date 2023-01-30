const app = require('./app/app.js') //app from app.js
const http = require('http'); //http
const server = http.createServer(app); //create server
const { Server } = require("socket.io"); //import socketio
const io = new Server(server); //creating io server
const PORT = process.env.PORT || 3000 //port if env.PORT is available otherwise 3000

var usernames = {} //maintaining usernames
var activeRooms = [] //maintaining active rooms

//on new connections
io.on('connection', (socket) => {

    //broadcasting msg except itself
    socket.on('chat-message', (msg) => {
        socket.broadcast.to(data.roomid).emit('chat-message', msg);
    });

    //create room event
    socket.on('create-room', (roomid) => {
        socket.rooms = roomid //create a room in socketio
        activeRooms.push(roomid) // add the room to activeRooms to maintain it
    })

    //when joining a room
    socket.on('join-room', (data) => {
        if (activeRooms.includes(data.roomid)) { //chec if the room exist
            socket.join(data.roomid) //join the room
            socket.broadcast.to(data.roomid).emit('update-about-room', data.username + ' has connected to this room'); //broadcast msg to that room about the joining of new user
        }
    })
});

//server start
server.listen(PORT, (err) => {
    if (err)
        console.log(`Error starting the server ${err}`)
    else
        console.log(`Server starting on PORT ${PORT}`);
});