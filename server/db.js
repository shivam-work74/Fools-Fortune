import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// --- Mongoose Schema ---
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    stats: {
        wins: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        matches: { type: Number, default: 0 },
        timesQueenHeld: { type: Number, default: 0 },
        rivals: { type: Map, of: Number, default: {} },
        skillRating: { type: Number, default: 1000 },
        uno: {
            cardsPlayed: { type: Number, default: 0 },
            skipsUsed: { type: Number, default: 0 },
            reversesUsed: { type: Number, default: 0 },
            drawsUsed: { type: Number, default: 0 }, // +2 and +4
            wildsUsed: { type: Number, default: 0 },
            successfulUnos: { type: Number, default: 0 },
            failedUnos: { type: Number, default: 0 }
        }
    },
    matchHistory: [{
        game: String, // 'uno' or 'fools-fortune'
        result: String, // 'win' or 'loss'
        date: { type: Date, default: Date.now },
        details: mongoose.Schema.Types.Mixed // Flexible storage for match-specific metrics
    }]
});

const User = mongoose.model('User', userSchema);

// --- DB Functions ---

export async function initDB() {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/fools-fortune';
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

export async function getUser(username) {
    return await User.findOne({ username });
}

export async function createUser(username, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        username,
        password: hashedPassword,
        stats: {
            wins: 0,
            losses: 0,
            matches: 0,
            timesQueenHeld: 0,
            rivals: {},
            skillRating: 1000,
            uno: {
                cardsPlayed: 0, skipsUsed: 0, reversesUsed: 0,
                drawsUsed: 0, wildsUsed: 0, successfulUnos: 0, failedUnos: 0
            }
        },
        matchHistory: []
    });
    return await newUser.save();
}

export async function verifyUser(username, password) {
    const user = await User.findOne({ username });
    if (!user) return null;
    const match = await bcrypt.compare(password, user.password);
    return match ? user : null;
}

export async function updateUserStats(username, result, details = {}) {
    const user = await User.findOne({ username });
    if (!user) return;

    user.stats.matches += 1;

    // Skill Rating Shift (Basic Elo logic: +15 for win, -10 for loss)
    if (result === 'win') {
        user.stats.wins += 1;
        user.stats.skillRating += 15;
    } else {
        user.stats.losses += 1;
        user.stats.skillRating = Math.max(0, user.stats.skillRating - 10);
    }

    // Record Match History
    const matchRecord = {
        game: details.game || 'fools-fortune',
        result,
        date: new Date(),
        details: { ...details }
    };

    // Keep only last 20 matches for performance
    user.matchHistory.unshift(matchRecord);
    if (user.matchHistory.length > 20) user.matchHistory.pop();

    // UNO Specific Analytics
    if (details.game === 'uno') {
        if (!user.stats.uno) user.stats.uno = { cardsPlayed: 0, skipsUsed: 0, reversesUsed: 0, drawsUsed: 0, wildsUsed: 0, successfulUnos: 0, failedUnos: 0 };

        const u = user.stats.uno;
        const s = details.sessionStats || {};
        u.cardsPlayed += (s.cardsPlayed || 0);
        u.skipsUsed += (s.skipsUsed || 0);
        u.reversesUsed += (s.reversesUsed || 0);
        u.drawsUsed += (s.drawsUsed || 0);
        u.wildsUsed += (s.wildsUsed || 0);
        u.successfulUnos += (s.successfulUnos || 0);
        u.failedUnos += (s.failedUnos || 0);
    }

    // Fool's Fortune Specific
    if (details.game === 'fools-fortune') {
        if (result === 'loss') {
            if (details.heldQueen) user.stats.timesQueenHeld += 1;
            if (details.winner) {
                const rival = details.winner;
                const currentCount = user.stats.rivals.get(rival) || 0;
                user.stats.rivals.set(rival, currentCount + 1);
            }
        }
    }

    await user.save();
}

export async function getTopPlayers() {
    const users = await User.find().sort({ 'stats.wins': -1 }).limit(10);
    return users.map(u => ({ username: u.username, wins: u.stats.wins }));
}
