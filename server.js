const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // Чтобы сервер понимал JSON от нашего приложения

// Временная база данных в памяти (сбросится при перезапуске сервера)
// Для реального проекта нужно использовать базу данных (MongoDB, PostgreSQL)
const users = {}; 
const codes = {};

// ==========================================
// API ДЛЯ АВТОРИЗАЦИИ И РЕГИСТРАЦИИ
// ==========================================

// 1. Запрос на вход (отправка кода)
app.post('/api/login/request', (req, res) => {
    const { email, password } = req.body;
    if (!users[email]) {
        return res.status(400).json({ ok: false, error: 'Пользователь не найден' });
    }
    if (users[email].password !== password) {
        return res.status(400).json({ ok: false, error: 'Неверный пароль' });
    }

    // Генерируем код
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    codes[email] = code;
    
    // ВАЖНО: В реальности тут надо отправлять email. 
    // Пока сервер просто выведет код в консоль Render.
    console.log(`[КОД ДЛЯ ${email}]: ${code}`);

    res.json({ ok: true });
});

// 2. Проверка кода при входе
app.post('/api/login/verify', (req, res) => {
    const { email, code } = req.body;
    if (codes[email] !== code) {
        return res.status(400).json({ ok: false, error: 'Неверный код' });
    }
    
    // Код верный, авторизуем
    delete codes[email];
    res.json({ 
        ok: true, 
        name: users[email].name, 
        token: 'token_' + Date.now() 
    });
});

// 3. Запрос на регистрацию (отправка кода)
app.post('/api/register/request', (req, res) => {
    const { name, email, password } = req.body;
    if (users[email]) {
        return res.status(400).json({ ok: false, error: 'Эта почта уже занята' });
    }

    // Временно сохраняем данные до ввода кода
    codes[email] = {
        code: Math.floor(100000 + Math.random() * 900000).toString(),
        name: name,
        password: password
    };
    
    console.log(`[КОД ДЛЯ РЕГИСТРАЦИИ ${email}]: ${codes[email].code}`);

    res.json({ ok: true });
});

// 4. Проверка кода при регистрации
app.post('/api/register/verify', (req, res) => {
    const { email, code } = req.body;
    const pending = codes[email];
    
    if (!pending || typeof pending === 'string' || pending.code !== code) {
        return res.status(400).json({ ok: false, error: 'Неверный код' });
    }

    // Создаем пользователя
    users[email] = {
        name: pending.name,
        password: pending.password
    };
    delete codes[email];

    res.json({ 
        ok: true, 
        token: 'token_' + Date.now() 
    });
});


// ==========================================
// WEBSOCKET ЧАТ (твой старый код)
// ==========================================
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Новый игрок подключился к чату');
    ws.on('message', (message) => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });
    ws.on('close', () => {
        console.log('Игрок отключился от чата');
    });
});

// Запуск сервера
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Сервер успешно запущен на порту ${PORT}`);
});