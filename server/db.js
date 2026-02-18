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
        rivals: { type: Map, of: Number, default: {} } // Map for storing rival counts
    }
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
        process.exit(1); // Exit if DB connection fails
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
            rivals: {}
        }
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

    if (result === 'win') {
        user.stats.wins += 1;
    }

    if (result === 'loss') {
        user.stats.losses += 1;
        if (details.heldQueen) {
            user.stats.timesQueenHeld += 1;
        }
        if (details.winner) {
            const rival = details.winner;
            // Handle Map for rivals
            const currentCount = user.stats.rivals.get(rival) || 0;
            user.stats.rivals.set(rival, currentCount + 1);
        }
    }

    await user.save();
}

export async function getTopPlayers() {
    const users = await User.find().sort({ 'stats.wins': -1 }).limit(10);
    return users.map(u => ({ username: u.username, wins: u.stats.wins }));
}
