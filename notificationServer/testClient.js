// websocket_client.js

const { io } = require('socket.io-client');

// 連接到 WebSocket 伺服器
const socket = io('http://localhost:3002'); // 替換為實際的伺服器位址

// 監聽連接成功事件
socket.on('connect', () => {
    console.log('成功連接到 WebSocket 伺服器');
    console.log('Socket ID:', socket.id);

    // 發送訊息到伺服器
    socket.emit('message', JSON.stringify({ userId: 1 }));
});

    // 監聽來自伺服器的訊息
    socket.on('message', (data) => {
        console.log('來自伺服器的訊息:', data);
    });

// 監聽斷線事件
socket.on('disconnect', (reason) => {
    console.warn('已斷線，原因:', reason);
});
