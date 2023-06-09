const app = require('./app/app.js') //app from app.js
const http = require('http'); //http
const server = http.createServer(app); //create server
const { Server } = require("socket.io"); //import socketio
const io = new Server(server); //creating io server
const PORT = process.env.PORT || 3000 //port if env.PORT is available otherwise 3000
const postgresQueries = require('./app/postgresQueries') //importing postgres queries

//on new connections
io.on('connection', (socket) => {

    //create room event
    socket.on('create-room', async (data) => {
        try {
            console.log(data)
            await postgresQueries.insertroomIntoDB(data) //inserting new room with active status to db
            await postgresQueries.updateOwnRoomCount(data)
            socket.rooms[data.roomId] = data.roomName //create a room in socketio
            console.log(socket.rooms) //logging //!removal
        } catch (err) {
            socket.emit('create-room-error', err) //throwing room error
        }
    })


    //when joining a room
    socket.on('join-room', async (data) => { //data will have username, roomid, message
        try {
            const roomExists = await postgresQueries.getActiveRoomStatusForAskedRoomID(data) //fetching room active status
            if (roomExists) { //checking if room exists
                socket.username = data.userName //store username in socket session for this client //? needed???
                socket.join(data.roomId) //join the room
                socket.broadcast.to(data.roomId).emit('join-room-event', data.userName + ' has connected to this room'); //broadcast msg to that room about the joining of new user
                await postgresQueries.updateUserIsFreeStatus(data) //updating is_free in chatting_users
                const roomName = await postgresQueries.getActiveRoomNameForAskedRoomID(data)
                socket.emit('join-room-name', roomName) //? needed?
                console.log('joined') //logging
            }
        } catch (err) {
            socket.emit('join-room-error', err) //error
        }
    })
    socket.on('user-joined-room', async (data) => {
        const roomExists = await postgresQueries.getActiveRoomStatusForAskedRoomID(data)
        if (roomExists) {
            socket.broadcast.to(data.roomId).emit('join-room-event', data.userName + ' has connected to this room'); //broadcast msg to that room about the joining of new user
        }
    })


    //broadcast to room about user typing //! currently not used anywhere
    socket.on('user-typing', async (data) => {
        const roomExists = await postgresQueries.getActiveRoomStatusForAskedRoomID(data)
        if (roomExists) {
            socket.broadcast.to(data.roomId).emit('typing-event', data.userName + ' is typing'); //broadcast msg to that room about user typing
        }
    })


    //broadcasting msg except itself
    socket.on('chat-message', async (data) => {
        try {
            const roomExists = await postgresQueries.getActiveRoomStatusForAskedRoomID(data)
            if (roomExists) {
                socket.broadcast.to(data.roomId).emit('chat-message', data); //broadcast to specific room
                console.log(data) //!removal
                // socket.emit('chat-message', data)
            }
        } catch (err) {
            socket.emit('chat-message-error', err) //error
        }
    });


    //broadcast to room about user left
    socket.on('leave-room', async (data) => { //data will have username, roomid, message
        const roomExists = await postgresQueries.getActiveRoomStatusForAskedRoomID(data)
        if (roomExists) {
            await postgresQueries.updateJoinerLeftStatus(data) //updating joiner left status in chatting_rooms
            await postgresQueries.updateUserIsFreeStatus(data) //updating user is_free in chatting_users
            socket.broadcast.to(data.roomId).emit('leave-room-event', data.userName + ' left this room'); //broadcast msg to that room about the leaving of new user
            socket.leave(data.roomId) //leaving the room
        } else {
            socket.emit('room-error', "the room does not exist") // error
        }
    })


    //when user disconnects    
    socket.on('disconnect', () => { //data will have username, room id
        // socket.broadcast.to(data.roomid).emit('room-event', data.name + ' left this room this room'); //broadcast msg to that room about the leaving of new user
    })
});

//server start
server.listen(PORT, (err) => {
    if (err)
        console.log(`Error starting the server ${err}`)
    else
        console.log(`Server starting on PORT ${PORT}`);
});