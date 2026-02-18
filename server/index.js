
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { initDB, getUser, createUser, verifyUser, updateUserStats, getTopPlayers } from './db.js';
import { handleGameEvents } from './gameManager.js';

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

// --- Start Server ---

const PORT = process.env.PORT || 3001;
// Initialize DB then start listening
initDB().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
