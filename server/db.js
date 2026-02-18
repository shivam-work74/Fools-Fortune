
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

// Setup LowDB
const adapter = new JSONFile('db.json');
const db = new Low(adapter, { users: [] });

export async function initDB() {
    await db.read();
    db.data ||= { users: [] };
    await db.write();
}

export async function getUser(username) {
    await db.read();
    return db.data.users.find(u => u.username === username);
}

export async function createUser(username, password) {
    await db.read();
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
        id: nanoid(),
        username,
        password: hashedPassword,
        stats: {
            wins: 0,
            losses: 0,
            matches: 0,
            timesQueenHeld: 0,
            rivals: {} // username -> count of times lost to them
        }
    };
    db.data.users.push(newUser);
    await db.write();
    return newUser;
}

export async function verifyUser(username, password) {
    await db.read(); // Ensure fresh data
    const user = db.data.users.find(u => u.username === username);
    if (!user) return null;
    const match = await bcrypt.compare(password, user.password);
    return match ? user : null;
}

export async function updateUserStats(username, result, details = {}) { // result: 'win' | 'loss', details: { winner: string, heldQueen: boolean }
    await db.read();
    const user = db.data.users.find(u => u.username === username);
    if (!user) return;

    if (!user.stats.timesQueenHeld) user.stats.timesQueenHeld = 0;
    if (!user.stats.rivals) user.stats.rivals = {};

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
            user.stats.rivals[rival] = (user.stats.rivals[rival] || 0) + 1;
        }
    }

    await db.write();
}

export async function getTopPlayers() {
    await db.read();
    return db.data.users
        .map(u => ({ username: u.username, wins: u.stats.wins }))
        .sort((a, b) => b.wins - a.wins)
        .slice(0, 10);
}
