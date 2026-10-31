const WebSocket = require('ws');

// Render сам передает порт через переменную окружения, либо используем 8080 для тестов
const PORT = process.env.PORT || 8080; 
const server = new WebSocket.Server({ port: PORT });

server.on('connection', (ws) => {
    console.log('Новый игрок подключился к чату');

    ws.on('message', (message) => {
        // Пересылаем полученное сообщение всем активным игрокам
        server.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });

    ws.on('close', () => {
        console.log('Игрок отключился от чата');
    });
});

console.log(`Сервер чата успешно запущен на порту ${PORT}`);
