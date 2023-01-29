const app = require('./app/app.js') //app from app.js
const http = require('http'); //http
const server = http.createServer(app); //create server
const { Server } = require("socket.io"); //import socketio
const io = new Server(server); //creating io server
const PORT = process.env.PORT || 3000 //port if env.PORT is available otherwise 3000

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