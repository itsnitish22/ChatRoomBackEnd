const app = require('./app/app.js')
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const e = require('express');
const io = new Server(server);
const PORT = process.env.PORT || 3000

//on new connections
io.on('connection', (socket) => {

    //broadcasting msg except itself
    socket.on('chat message', (msg) => {
        socket.broadcast.emit('chat message', msg);
    });

});

//server start
server.listen(PORT, (err) => {
    if (err)
        console.log(`Error starting the server ${err}`)
    else
        console.log(`Server starting on PORT ${PORT}`);
});