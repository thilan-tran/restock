const io = require('socket.io-client');

const socket = io.connect('http://localhost:3000');

socket.on('connect', () => {
  console.log('Websocket connected');
});

socket.on('message', (data) => console.log(data));
