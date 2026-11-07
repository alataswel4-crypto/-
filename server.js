const express = require('express');
const cors = require('cors');
const app = express();

// Разрешаем серверу принимать JSON и запросы с других сайтов (CORS)
app.use(cors());
app.use(express.json());

// --- ХРАНИЛИЩЕ (В ПАМЯТИ) ---
// Внимание: при перезапуске сервера на Render эти данные обнулятся!
// Для реального проекта нужно подключить MongoDB.
let players = {}; // База игроков: { "id": { name, level, avatar, ... } }
let chatMessages = []; // История чата

// --- 1. API ДЛЯ ПРОФИЛЯ ---

// Создать или обновить профиль игрока (POST /api/profile)
app.post('/api/profile', (req, res) => {
    const { id, name, level, avatar } = req.body;
    
    if (!id || !name) {
        return res.status(400).json({ error: "Нужны поля id и name" });
    }

    // Сохраняем или обновляем данные игрока
    players[id] = {
        id: id,
        name: name,
        level: level || 1,
        avatar: avatar || "default.png",
        lastSeen: new Date()
    };

    res.json({ success: true, message: "Профиль сохранен", profile: players[id] });
});

// Получить профиль игрока (GET /api/profile/:id)
app.get('/api/profile/:id', (req, res) => {
    const playerId = req.params.id;
    const player = players[playerId];

    if (player) {
        res.json(player);
    } else {
        res.status(404).json({ error: "Игрок не найден" });
    }
});


// --- 2. API ДЛЯ ЧАТА ---

// Отправить сообщение в чат (POST /api/chat)
app.post('/api/chat', (req, res) => {
    const { playerId, playerName, text } = req.body;

    if (!playerId || !text) {
        return res.status(400).json({ error: "Нужны поля playerId и text" });
    }

    const message = {
        id: Date.now().toString(), // Уникальный ID сообщения
        playerId: playerId,
        playerName: playerName || "Аноним",
        text: text,
        timestamp: new Date().toISOString()
    };

    chatMessages.push(message);

    // Ограничиваем историю чата последними 50 сообщениями (чтобы не забить память)
    if (chatMessages.length > 50) {
        chatMessages.shift(); 
    }

    res.json({ success: true, message: "Сообщение отправлено" });
});

// Получить историю чата (GET /api/chat)
app.get('/api/chat', (req, res) => {
    // Возвращаем последние 50 сообщений
    res.json(chatMessages);
});


// --- ЗАПУСК СЕРВЕРА ---
// Render автоматически задает порт через переменную окружения PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});