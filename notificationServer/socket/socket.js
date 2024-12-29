require('dotenv').config();
const http = require('http');
const socketIo = require('socket.io');
const mqtt = require('mqtt');

// Oi Trigger building socket pipleine
const server = http.createServer((req, res) => { });
const io = socketIo(server, {
        cors: {
            origin: [process.env.CLIENT_URL],
        }
    }
);

let mqttClient = mqtt.connect(process.env.MQ_URL);

mqttClient.on("connect", () => {
    mqttClient.subscribe("WEBSOCKET", (err) => { });
    console.log("mqtt connected");
});

io.on('connection', (socket) => {
    socket.on('message', (data) => {
        if (JSON.parse(data).hasOwnProperty('userId')) {
            socket.join(JSON.parse(data).userId.toString());
            console.log("add user to room: " + JSON.parse(data).userId.toString());
        }
    });
});

// 啟動伺服器
const PORT = 3002;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

mqttClient.on("message", (topic, message) => {
    data = JSON.parse(message.toString());
    if (data.length > 0) {
        console.log(data);
        data.forEach(element => {
            console.log("send to user: " + element.userId.toString());
            io.to(element.userId.toString()).emit("message", JSON.stringify(element));
        });
    }
});