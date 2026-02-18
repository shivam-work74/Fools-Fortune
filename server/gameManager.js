
import { nanoid } from 'nanoid';
import { updateUserStats } from './db.js';

// In-memory game state
const lobbies = new Map(); // lobbyId -> { id, hostId, players: [], status: 'waiting'|'playing', gameState: {} }

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function createDeck() {
    let id = 0;
    const deck = [];
    for (const s of SUITS) {
        for (const r of RANKS) {
            if (r === "Q" && s === "♣") continue; // Old Maid Logic
            deck.push({ id: `c${id++}`, rank: r, suit: s });
        }
    }
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function dealCards(deck, numPlayers) {
    const hands = Array.from({ length: numPlayers }, () => []);
    deck.forEach((card, i) => hands[i % numPlayers].push(card));
    return hands;
}

function removePairs(hand) {
    const counts = new Map();
    const discards = [];
    const kept = [];
    for (const c of hand) {
        if (!counts.has(c.rank)) counts.set(c.rank, []);
        counts.get(c.rank).push(c);
    }
    for (const [rank, cards] of counts) {
        while (cards.length >= 2) {
            discards.push(cards.pop());
            discards.push(cards.pop());
        }
        if (cards.length > 0) kept.push(cards[0]);
    }
    return { hand: kept, discards };
}


export function handleGameEvents(io, socket) {

    // --- LOBBY MANAGEMENT ---

    socket.on('createLobby', ({ username, avatar, mode }) => {
        const lobbyId = nanoid(5);
        const player = { id: socket.id, username, avatar, isHost: true };

        lobbies.set(lobbyId, {
            id: lobbyId,
            hostId: socket.id,
            mode: mode || 4, // 2 or 4 players
            players: [player],
            status: 'waiting',
            gameState: null,
            settings: {
                speedProtocol: false,
                blindFaith: false,
                jokersWild: false
            }
        });

        socket.join(lobbyId);
        socket.emit('lobbyCreated', { lobbyId, players: [player] });
        console.log(`Lobby ${lobbyId} created by ${username}`);
    });

    socket.on('joinLobby', ({ lobbyId, username, avatar }) => {
        const lobby = lobbies.get(lobbyId);
        if (!lobby) return socket.emit('error', 'Lobby not found');
        if (lobby.status !== 'waiting') return socket.emit('error', 'Game already started');
        if (lobby.players.length >= lobby.mode) return socket.emit('error', 'Lobby full');

        // Prevent duplicate join
        if (lobby.players.find(p => p.id === socket.id)) return;

        const player = { id: socket.id, username, avatar, isHost: false };
        lobby.players.push(player);
        socket.join(lobbyId);

        io.to(lobbyId).emit('playerJoined', { players: lobby.players });

        // Send current settings to new joiner
        if (lobby.settings) {
            socket.emit('settingsUpdated', lobby.settings);
        }

        console.log(`${username} joined lobby ${lobbyId}`);
    });

    socket.on('joinSpectator', ({ lobbyId, username }) => {
        const lobby = lobbies.get(lobbyId);
        if (!lobby) return socket.emit('error', 'Lobby not found');

        socket.join(lobbyId);

        // If game is in progress, send current state (masked) to spectator
        if (lobby.status === 'playing' && lobby.gameState) {
            const state = lobby.gameState;
            const privateState = {
                ...state,
                myHand: [], // Spectators have no hand
                players: state.players.map(ps => ({
                    ...ps,
                    hand: undefined,
                    handCount: ps.hand.length
                })),
                isSpectating: true
            };
            socket.emit('gameStarted', privateState); // Re-use gameStarted to load board
        }
    });

    socket.on('kickPlayer', ({ lobbyId, targetId }) => {
        const lobby = lobbies.get(lobbyId);
        if (!lobby || lobby.hostId !== socket.id) return;

        const targetIdx = lobby.players.findIndex(p => p.id === targetId);
        if (targetIdx === -1) return;

        const removedPlayer = lobby.players.splice(targetIdx, 1)[0];

        // Notify the kicked player
        io.to(removedPlayer.id).emit('kicked');
        // Force leave room
        io.sockets.sockets.get(removedPlayer.id)?.leave(lobbyId);

        // Notify lobby
        io.to(lobbyId).emit('playerJoined', { players: lobby.players });
    });

    socket.on('updateSettings', ({ lobbyId, settings }) => {
        const lobby = lobbies.get(lobbyId);
        if (!lobby || lobby.hostId !== socket.id) return;

        lobby.settings = settings;
        socket.to(lobbyId).emit('settingsUpdated', settings);
    });

    socket.on('startGame', ({ lobbyId }) => {
        const lobby = lobbies.get(lobbyId);
        if (!lobby || lobby.hostId !== socket.id) return;

        // Check player count (for now allow starting with any count > 1 for testing)
        if (lobby.players.length < 2) return socket.emit('error', 'Need at least 2 players');

        // Init Game State
        const deck = createDeck();
        const rawHands = dealCards(deck, lobby.players.length);
        const playersState = lobby.players.map((p, idx) => {
            const { hand, discards } = removePairs(rawHands[idx]);
            return {
                ...p,
                hand,
                discards,
                finished: false,
                handCount: hand.length
            };
        });

        // Determine starter (random)
        const turnIndex = Math.floor(Math.random() * playersState.length);

        lobby.status = 'playing';
        lobby.gameState = {
            players: playersState,
            turnIndex,
            loser: null
        };

        // Send initial state to everyone
        // IMPORTANT: Don't send other players' full hands, only counts!
        lobby.players.forEach((p, idx) => {
            const privateState = {
                ...lobby.gameState,
                myHand: playersState[idx].hand, // Only send THEIR hand
                players: playersState.map(ps => ({
                    ...ps,
                    hand: undefined, // Hide others' hands
                    handCount: ps.hand.length
                }))
            };
            io.to(p.id).emit('gameStarted', privateState);
        });
    });

    // --- GAMEPLAY Sockets ---

    socket.on('playTurn', ({ lobbyId, targetPlayerIdx, cardIdx }) => {
        const lobby = lobbies.get(lobbyId);
        if (!lobby || lobby.status !== 'playing') return;

        const state = lobby.gameState;
        const currentPlayerIdx = state.players.findIndex(p => p.id === socket.id);

        if (currentPlayerIdx !== state.turnIndex) return; // Not your turn

        const targetPlayer = state.players[targetPlayerIdx];
        const currentPlayer = state.players[currentPlayerIdx];

        // Validate Draw
        // Logic: Current player picks from Target (usually next player, or specific if implementation allows)
        // For Old Maid, usually you pick from the person to your Right or Left. 
        // Let's assume standard: Pick from ALIVE player to your LEFT (next index).

        // Simply perform the draw
        // In a real implementation we would validate if target is correct neighbor.

        if (!targetPlayer.hand || targetPlayer.hand.length === 0) return;

        // Pick card (random logic if index not provided, but usually UI sends index)
        // If cardIdx provided (from UI click on back of card), use it. Else random.
        const actualCardIdx = (cardIdx !== null && cardIdx < targetPlayer.hand.length)
            ? cardIdx
            : Math.floor(Math.random() * targetPlayer.hand.length);

        const drawnCard = targetPlayer.hand[actualCardIdx];

        // Remove from target
        targetPlayer.hand.splice(actualCardIdx, 1);
        targetPlayer.handCount--;

        // Add to current
        // Check pair
        const pairIdx = currentPlayer.hand.findIndex(c => c.rank === drawnCard.rank);
        let match = null;

        if (pairIdx !== -1) {
            match = currentPlayer.hand[pairIdx];
            currentPlayer.hand.splice(pairIdx, 1); // Remove pair
            currentPlayer.discards.push(match, drawnCard);
        } else {
            currentPlayer.hand.push(drawnCard);
        }
        currentPlayer.handCount = currentPlayer.hand.length;

        // Check Win/Loss conditions
        // Mark finished players
        state.players.forEach(p => {
            if (p.hand.length === 0 && !p.finished) {
                p.finished = true;
                updateUserStats(p.username, 'win');
            }
        });

        const activePlayers = state.players.filter(p => !p.finished);

        if (activePlayers.length === 1) {
            // GAME OVER
            state.loser = activePlayers[0];
            lobby.status = 'finished';

            // Find who finished last (the "Winner" of the standoff, essentially everyone but loser won, 
            // but for Nemesis we can track who dealt the final blow or just track losses. 
            // Simplified: Rivals = just track who beat you most? 
            // Actually in Old Maid, everyone beats the loser. 
            // Let's just track that they held the Queen.

            const heldQueen = state.loser.hand.some(c => c.rank === 'Q' && c.suit === '♣');

            updateUserStats(state.loser.username, 'loss', {
                heldQueen,
                // For simplicity, we won't assign a specific 'rival' here unless we track who gave the queen.
                // If we tracked card history we could see who passed the Queen last.
            });

            io.to(lobbyId).emit('gameOver', { loser: state.loser });
            lobbies.delete(lobbyId); // Cleanup
            return;
        }

        // Advance Turn
        let nextTurn = (state.turnIndex + 1) % state.players.length;
        while (state.players[nextTurn].finished) {
            nextTurn = (nextTurn + 1) % state.players.length;
        }
        state.turnIndex = nextTurn;


        // Broadcast Update
        lobby.players.forEach((p, idx) => {
            const privateState = {
                ...state,
                myHand: state.players[idx].hand, // Only send THEIR hand
                players: state.players.map(ps => ({
                    ...ps,
                    hand: undefined, // Hide others' hands
                    handCount: ps.hand.length
                })),
                lastAction: {
                    from: targetPlayer.username,
                    to: currentPlayer.username,
                    match: !!match
                }
            };
            io.to(p.id).emit('gameStateUpdate', privateState);
        });

        // Broadcast to Spectators (everyone else in room not in players list)
        // We can't easily filter sockets, but we can emit to room and let client ignore if they are a player? 
        // Better: iterate sockets in room? 
        // Easiest: Just emit a separate 'spectatorUpdate' to the room, players ignore it? 
        // Or: Clients are smart enough to handle 'gameStateUpdate'.
        // Let's modify the above loop to target specific player IDs, and then send a generic one to the room for spectators?
        // Actually, 'io.to(lobbyId)' goes to everyone.
        // Current logic sends individual messages to players.
        // Let's send a masked update to the whole room for spectators to pick up?
        // But players would get duplicate events.
        // Simple hack: Spectators just listen to 'spectatorUpdate'

        const spectatorState = {
            ...state,
            myHand: [],
            players: state.players.map(ps => ({
                ...ps,
                hand: undefined,
                handCount: ps.hand.length
            })),
            lastAction: {
                from: targetPlayer.username,
                to: currentPlayer.username,
                match: !!match
            }
        };
        socket.to(lobbyId).emit('spectatorUpdate', spectatorState);

    });


    socket.on('requestGameState', ({ lobbyId }) => {
        const lobby = lobbies.get(lobbyId);
        if (!lobby || lobby.status !== 'playing') return;

        const state = lobby.gameState;
        // Attempt to find player by ID first, then by username if available in socket
        const player = state.players.find(p => p.id === socket.id) ||
            state.players.find(p => p.username === socket.handshake.auth.username);

        if (!player) return;

        const pIdx = state.players.indexOf(player);

        const privateState = {
            ...state,
            myHand: player.hand,
            players: state.players.map(ps => ({
                ...ps,
                hand: undefined,
                handCount: ps.hand.length
            }))
        };
        socket.emit('gameStateUpdate', privateState);
    });

    socket.on('disconnect', () => {
        // Handle disconnects
    });
}

