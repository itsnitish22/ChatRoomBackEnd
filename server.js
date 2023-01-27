const express = require('express')
const app = express()
const server = require('http').createServer(app);
const WebSocket = require('ws');
const PORT = process.env.PORT || 80
const wss = new WebSocket.Server({ server: server });

wss.on('connection', function connection(ws) {
    console.log('A new client Connected!');
    ws.send('Welcome New Client!');

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);

        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
                // client.send(message.toString());
            }
        });
    });
});

app.get('/', (req, res) => res.send('Hello World!'))

server.listen(PORT, () => console.log(`Lisening on port :${PORT}`))