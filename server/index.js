
import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { initDB, getUser, createUser, verifyUser, updateUserStats, getTopPlayers } from './db.js';
import { handleGameEvents } from './gameManager.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow all for local dev
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// --- REST API for Auth ---

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Missing fields" });

    const existing = await getUser(username);
    if (existing) return res.status(409).json({ error: "Username taken" });

    const user = await createUser(username, password);
    res.json({ user: { id: user.id, username: user.username, stats: user.stats } });
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await verifyUser(username, password);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    res.json({ user: { id: user.id, username: user.username, stats: user.stats } });
});

app.get('/api/leaderboard', async (req, res) => {
    const top = await getTopPlayers();
    res.json(top);
});

// --- Socket.io for Real-Time Game ---

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    handleGameEvents(io, socket);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// --- Serve Static Files ---
app.use(express.static(path.join(__dirname, '../dist')));

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// --- Start Server ---

const PORT = process.env.PORT || 3001;
// Initialize DB then start listening
initDB().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });

    httpServer.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use. Please stop the other process and try again.`);
            process.exit(1);
        } else {
            throw err;
        }
    });
});
