const app = require('./app/app.js') //app from app.js
const http = require('http'); //http
const server = http.createServer(app); //create server
const { Server } = require("socket.io"); //import socketio
const io = new Server(server); //creating io server
const PORT = process.env.PORT || 3000 //port if env.PORT is available otherwise 3000

var activeUsernames = {} //maintaining usernames
var activeRooms = {} //maintaining active rooms

//on new connections
io.on('connection', (socket) => {

    //create room event
    socket.on('create-room', (data) => {
        try {
            socket.rooms[data.roomId] = data.roomName //create a room in socketio
            activeRooms[data.roomId] = data.roomName //creating room in local variables
            console.log(socket.rooms) //logging //!removal
        } catch (err) {
            socket.emit('create-room-error', err) //throwing room error
        }
    })


    //when joining a room
    socket.on('join-room', (data) => { //data will have username, roomid, message
        try {
            if (activeRooms[data.roomId] != null) { //check if the room exist
                activeUsernames[data.userName] = data.userName //adding username to global username
                socket.username = data.userName //store username in socket session for this client //? needed???
                socket.join(data.roomId) //join the room
                socket.broadcast.to(data.roomId).emit('join-room-event', data.userName + ' has connected to this room'); //broadcast msg to that room about the joining of new user
                socket.emit('join-room-name', activeRooms[data.roomId]) //? needed?
                console.log(activeRooms) //logging
            } else {
                console.log('room does not exist') //logging //!removal
                socket.emit('join-room-error', "the room does not exist") //throwing error
            }
        } catch (err) {
            console.log(err) //! removal
            socket.emit('join-room-error', err) //error
        }
    })


    //broadcast to room about user typing //! currently not used anywhere
    socket.on('user-typing', (data) => {
        if (activeRooms[data.roomId] != null) {
            socket.broadcast.to(data.roomId).emit('typing-event', data.userName + ' is typing'); //broadcast msg to that room about user typing
        }
    })


    //broadcasting msg except itself
    socket.on('chat-message', (data) => {
        try {
            if (activeRooms[data.roomId] != null) { //check if room exists
                socket.broadcast.to(data.roomId).emit('chat-message', data); //broadcast to specific room
                console.log(data) //!removal

                socket.emit('chat-message', data)  //! remove this line, written here for testing in frontend
            } else {
                socket.emit('chat-message-error', "room does not exist") //error
            }
        } catch (err) {
            socket.emit('chat-message-error', err) //error
        }
    });


    //broadcast to room about user left
    socket.on('leave-room', (data) => { //data will have username, roomid, message
        if (activeRooms[data.roomId] != null) { //chec if the room exist

            delete activeUsernames[socket.userName] //deleting the disconnecting user from activeUsers
            socket.broadcast.to(data.roomId).emit('leave-room-event', data.userName + ' left this room this room'); //broadcast msg to that room about the leaving of new user
            socket.leave(data.roomId) //leaving the room
        } else {
            socket.emit('room-error', "the room does not exist") // error
        }
    })


    //when user disconnects    
    socket.on('disconnect', () => { //data will have username, room id
        delete activeUsernames[socket.userName] //deleting the disconnecting user from activeUsers
        socket.broadcast.to(data.roomid).emit('room-event', data.name + ' left this room this room'); //broadcast msg to that room about the leaving of new user
    })
});

//server start
server.listen(PORT, (err) => {
    if (err)
        console.log(`Error starting the server ${err}`)
    else
        console.log(`Server starting on PORT ${PORT}`);
});