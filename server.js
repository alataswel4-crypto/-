const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Настраиваем Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Разрешаем подключение с любых сайтов/игр
    methods: ["GET", "POST"]
  }
});

// Простой тестовый маршрут, чтобы проверить, что сервер жив
app.get('/', (req, res) => {
  res.send('Сервер чата работает! Подключайтесь через Socket.io');
});

// Обработка подключений
io.on('connection', (socket) => {
  console.log('Игрок подключился. ID:', socket.id);

  // Слушаем событие 'chat message' от клиента
  socket.on('chat message', (data) => {
    // data должен содержать имя игрока и текст сообщения
    // Например: { user: "Player1", text: "Привет всем!" }
    
    console.log('Получено сообщение:', data);
    
    // Рассылаем это сообщение ВСЕМ подключенным игрокам
    io.emit('chat message', data); 
  });

  // Обработка отключения
  socket.on('disconnect', () => {
    console.log('Игрок отключился. ID:', socket.id);
  });
});

// Render автоматически передает порт в переменную окружения PORT
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});