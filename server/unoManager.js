
import { customAlphabet } from 'nanoid';
const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const nanoid = customAlphabet(alphabet, 6); // 6-character ID
import { updateUserStats } from './db.js';

// ─── In-memory state ──────────────────────────────────────────────────────────
const unoLobbies = new Map(); // lobbyId -> lobby

// ─── Deck Factory ─────────────────────────────────────────────────────────────
const COLORS = ['red', 'blue', 'green', 'yellow'];
const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const ACTIONS = ['skip', 'reverse', 'draw2'];

function createUnoDeck() {
    let id = 0;
    const deck = [];

    for (const color of COLORS) {
        // One 0 per color
        deck.push({ id: `u${id++}`, color, type: 'number', value: '0' });
        // Two of 1-9 per color
        for (const n of NUMBERS.slice(1)) {
            deck.push({ id: `u${id++}`, color, type: 'number', value: n });
            deck.push({ id: `u${id++}`, color, type: 'number', value: n });
        }
        // Two of each action per color
        for (const a of ACTIONS) {
            deck.push({ id: `u${id++}`, color, type: a, value: a });
            deck.push({ id: `u${id++}`, color, type: a, value: a });
        }
    }

    // 4 Wilds + 4 Wild Draw Fours
    for (let i = 0; i < 4; i++) {
        deck.push({ id: `u${id++}`, color: 'wild', type: 'wild', value: 'wild' });
        deck.push({ id: `u${id++}`, color: 'wild', type: 'wild4', value: 'wild4' });
    }

    return shuffle(deck);
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ─── Card Validity ────────────────────────────────────────────────────────────
function canPlayCard(card, topCard, currentColor) {
    if (card.type === 'wild' || card.type === 'wild4') return true;
    if (card.color === currentColor) return true;
    if (card.type === 'number' && topCard.type === 'number' && card.value === topCard.value) return true;
    if (card.type !== 'number' && card.type === topCard.type) return true;
    return false;
}

// ─── Draw pile management ─────────────────────────────────────────────────────
function ensureDrawPile(state) {
    if (state.drawPile.length === 0) {
        const top = state.discardPile[state.discardPile.length - 1];
        state.drawPile = shuffle(state.discardPile.slice(0, -1).map(c => ({
            ...c,
            color: (c.type === 'wild' || c.type === 'wild4') ? 'wild' : c.color
        })));
        state.discardPile = [top];
    }
}

function drawCards(state, count) {
    const drawn = [];
    for (let i = 0; i < count; i++) {
        ensureDrawPile(state);
        if (state.drawPile.length === 0) break;
        drawn.push(state.drawPile.pop());
    }
    return drawn;
}

// ─── Next turn helper ─────────────────────────────────────────────────────────
function nextPlayerIndex(state, skip = 0) {
    const n = state.players.length;
    let idx = state.turnIndex;
    for (let i = 0; i <= skip; i++) {
        idx = ((idx + state.direction) % n + n) % n;
        while (state.players[idx].finished) {
            idx = ((idx + state.direction) % n + n) % n;
        }
    }
    return idx;
}

// ─── Broadcast helpers ────────────────────────────────────────────────────────
function buildPrivateState(state, playerIndex) {
    return {
        ...state,
        myHand: state.players[playerIndex].hand,
        players: state.players.map((p, i) => ({
            id: p.id,
            username: p.username,
            avatar: p.avatar,
            isHost: p.isHost,
            peerId: p.peerId,
            handCount: p.hand.length,
            finished: p.finished,
            saidUno: p.saidUno,
        })),
        topCard: state.discardPile[state.discardPile.length - 1],
        drawPileCount: state.drawPile.length,
    };
}

function broadcastState(io, lobby) {
    const state = lobby.gameState;
    lobby.players.forEach((p, idx) => {
        io.to(p.id).emit('uno:gameStateUpdate', buildPrivateState(state, idx));
    });
}

// ─── Socket Handler ───────────────────────────────────────────────────────────
export function handleUnoEvents(io, socket) {

    // ── Create Lobby ──
    socket.on('uno:createLobby', ({ username, avatar, maxPlayers, peerId }) => {
        const lobbyId = 'UNO-' + nanoid();
        const player = { id: socket.id, username, avatar: avatar || '🃏', isHost: true, peerId };

        unoLobbies.set(lobbyId, {
            id: lobbyId,
            hostId: socket.id,
            maxPlayers: maxPlayers || 4,
            players: [player],
            status: 'waiting',
            gameState: null,
        });

        socket.join(lobbyId);
        socket.emit('uno:lobbyCreated', { lobbyId, players: [player] });
        console.log(`UNO Lobby ${lobbyId} created by ${username}`);
    });

    // ── Join Lobby ──
    socket.on('uno:joinLobby', ({ lobbyId, username, avatar, peerId }) => {
        const lobby = unoLobbies.get(lobbyId);
        if (!lobby) {
            console.log(`[UNO] Join failed: lobby ${lobbyId} not found`);
            return socket.emit('uno:error', `Lobby ${lobbyId} not found. Ask the host to share their table code again.`);
        }
        if (lobby.status !== 'waiting') return socket.emit('uno:error', 'Game already in progress');
        if (lobby.players.length >= lobby.maxPlayers) return socket.emit('uno:error', 'Table is full');

        // Prevent duplicate join
        const existingPlayer = lobby.players.find(p => p.id === socket.id);
        if (existingPlayer) {
            existingPlayer.peerId = peerId;
            io.to(lobbyId).emit('uno:playerJoined', { players: lobby.players });
            return;
        }

        const player = { id: socket.id, username, avatar: avatar || '🃏', isHost: false, peerId };
        lobby.players.push(player);
        socket.join(lobbyId);
        io.to(lobbyId).emit('uno:playerJoined', { players: lobby.players });
        console.log(`[UNO] ${username} joined lobby ${lobbyId}`);
    });

    // ── Start Game ──
    socket.on('uno:startGame', ({ lobbyId }) => {
        const lobby = unoLobbies.get(lobbyId);
        if (!lobby) return socket.emit('uno:error', 'Lobby not found');
        // Allow host by socket.id OR by username (handles reconnect edge case)
        const isHost = lobby.hostId === socket.id ||
            lobby.players.find(p => p.isHost && p.username === lobby.players.find(h => h.isHost)?.username)?.id === socket.id;
        if (lobby.players.length < 2) return socket.emit('uno:error', 'Need at least 2 players');
        // Update socket.id of host to current in case of reconnect
        const hostPlayer = lobby.players.find(p => p.id === lobby.hostId || p.isHost);
        if (!hostPlayer || (hostPlayer.id !== socket.id && lobby.hostId !== socket.id)) {
            return socket.emit('uno:error', 'Only the host can start the game');
        }
        // Update host socket.id if drifted
        lobby.hostId = socket.id;
        if (hostPlayer) hostPlayer.id = socket.id;

        const deck = createUnoDeck();
        const numPlayers = lobby.players.length;

        // Deal 7 cards each
        const hands = Array.from({ length: numPlayers }, () => []);
        for (let i = 0; i < 7 * numPlayers; i++) {
            hands[i % numPlayers].push(deck.pop());
        }

        // Flip top card (must not be a wild/wild4 to start)
        let topCard;
        do {
            topCard = deck.pop();
            if (topCard.type === 'wild' || topCard.type === 'wild4') {
                deck.unshift(topCard); // put back at bottom
                topCard = null;
            }
        } while (!topCard);

        const playersState = lobby.players.map((p, i) => ({
            ...p,
            hand: hands[i],
            finished: false,
            saidUno: false,
            drawStack: 0,
            sessionStats: {
                cardsPlayed: 0, skipsUsed: 0, reversesUsed: 0,
                drawsUsed: 0, wildsUsed: 0, successfulUnos: 0, failedUnos: 0
            }
        }));

        const startTurnIndex = Math.floor(Math.random() * numPlayers);
        let direction = 1;

        // Apply top card action if needed
        let skipFirst = false;
        if (topCard.type === 'reverse' && numPlayers === 2) {
            // In 2-player, Reverse acts like Skip
            skipFirst = true;
        } else if (topCard.type === 'skip') {
            skipFirst = true;
        } else if (topCard.type === 'draw2') {
            // First player draws 2 and is skipped
            const drawn = drawCards({ drawPile: deck, discardPile: [topCard] }, 2);
            playersState[startTurnIndex].hand.push(...drawn);
            skipFirst = true;
        } else if (topCard.type === 'reverse') {
            direction = -1;
        }

        lobby.status = 'playing';
        lobby.gameState = {
            players: playersState,
            drawPile: deck,
            discardPile: [topCard],
            currentColor: topCard.color,
            direction,
            turnIndex: startTurnIndex,
            drawAccumulator: 0, // stacked draw2/wild4 force-draw amount
            pendingColor: false, // waiting for color choice after wild
            lastPlayedCard: topCard,
            gameOver: false,
        };

        if (skipFirst) {
            lobby.gameState.turnIndex = nextPlayerIndex(lobby.gameState, 0);
        }

        // Emit gameStarted FIRST so clients navigate and register listeners,
        // THEN broadcast the state so they receive it after mounting.
        io.to(lobbyId).emit('uno:gameStarted', { lobbyId });
        // Small delay to allow React navigation + listener registration before state arrives
        setTimeout(() => broadcastState(io, lobby), 150);
        console.log(`UNO Game started in ${lobbyId}`);
    });

    // ── Play Card ──
    socket.on('uno:playCard', ({ lobbyId, cardId, chosenColor }) => {
        const lobby = unoLobbies.get(lobbyId);
        if (!lobby || lobby.status !== 'playing') return;
        const state = lobby.gameState;
        if (state.pendingColor) return socket.emit('uno:error', 'Waiting for color choice');

        const playerIdx = state.players.findIndex(p => p.id === socket.id);
        if (playerIdx !== state.turnIndex) return socket.emit('uno:error', 'Not your turn');

        const player = state.players[playerIdx];
        const cardIdx = player.hand.findIndex(c => c.id === cardId);
        if (cardIdx === -1) return socket.emit('uno:error', 'Card not in hand');

        const card = player.hand[cardIdx];
        const topCard = state.discardPile[state.discardPile.length - 1];

        // ── Stacking: if draw accumulator is active, only draw2 on draw2, or wild4 on wild4 is allowed
        if (state.drawAccumulator > 0) {
            const isDrawCard = (card.type === 'draw2' || card.type === 'wild4');
            // Only allow stacking draw2 on draw2, wild4 on wild4
            const stackType = topCard.type === 'draw2' ? 'draw2' : 'wild4';
            if (!isDrawCard || card.type !== stackType) {
                return socket.emit('uno:error', `You must play a ${stackType} or draw ${state.drawAccumulator} cards`);
            }
        }

        // ── Validate playability ──
        if (!canPlayCard(card, topCard, state.currentColor)) {
            return socket.emit('uno:error', 'Cannot play this card here');
        }

        // Remove from hand
        player.hand.splice(cardIdx, 1);
        player.saidUno = false;

        // ── UNO penalty check: if player now has 1 card and didn't say UNO earlier
        // This is handled via uno:saidUno event before playing; we mark it here for checking
        if (player.hand.length === 1 && !player.saidUno) {
            player.pendingUnoPenalty = true; // another player can call this out
        } else {
            player.pendingUnoPenalty = false;
        }

        // Update Stats
        player.sessionStats.cardsPlayed += 1;
        if (card.type === 'skip') player.sessionStats.skipsUsed += 1;
        if (card.type === 'reverse') player.sessionStats.reversesUsed += 1;
        if (card.type === 'draw2') player.sessionStats.drawsUsed += 1;
        if (card.type === 'wild') player.sessionStats.wildsUsed += 1;
        if (card.type === 'wild4') {
            player.sessionStats.drawsUsed += 1;
            player.sessionStats.wildsUsed += 1;
        }

        // Put card on discard
        state.discardPile.push(card);
        state.lastPlayedCard = card;
        state.currentColor = (card.type === 'wild' || card.type === 'wild4') ? (chosenColor || 'wild') : card.color;

        if ((card.type === 'wild' || card.type === 'wild4') && !chosenColor) {
            state.pendingColor = true;
            state.pendingColorPlayerIdx = playerIdx;
            broadcastState(io, lobby);
            socket.emit('uno:chooseColor', {});
            return;
        }

        // ── Apply card effect ──
        applyCardEffect(io, lobby, card, playerIdx);
    });

    // ── Choose Color (after Wild) ──
    socket.on('uno:chooseColor', ({ lobbyId, color }) => {
        const lobby = unoLobbies.get(lobbyId);
        if (!lobby || !lobby.gameState?.pendingColor) return;
        const state = lobby.gameState;
        if (state.pendingColorPlayerIdx !== state.players.findIndex(p => p.id === socket.id)) return;

        state.currentColor = color;
        state.pendingColor = false;

        const card = state.lastPlayedCard;
        applyCardEffect(io, lobby, card, state.pendingColorPlayerIdx, true);
    });

    // ── Draw Card ──
    socket.on('uno:drawCard', ({ lobbyId }) => {
        const lobby = unoLobbies.get(lobbyId);
        if (!lobby || lobby.status !== 'playing') return;
        const state = lobby.gameState;

        const playerIdx = state.players.findIndex(p => p.id === socket.id);
        if (playerIdx !== state.turnIndex) return;

        const player = state.players[playerIdx];

        // If there's a draw accumulator (stacked draws forced on this player)
        const drawCount = state.drawAccumulator > 0 ? state.drawAccumulator : 1;
        state.drawAccumulator = 0;

        const drawn = drawCards(state, drawCount);
        player.hand.push(...drawn);
        player.saidUno = false;
        player.pendingUnoPenalty = false;

        // After forced draw, turn advances; after voluntary draw, player can play if draw was 1
        const isForced = drawCount > 1;
        state.turnIndex = nextPlayerIndex(state, 0);

        broadcastState(io, lobby);
        io.to(lobbyId).emit('uno:cardDrawn', {
            playerIdx,
            drawCount,
            forced: isForced,
            nextTurn: state.turnIndex,
        });
    });

    // ── Say UNO ──
    socket.on('uno:sayUno', ({ lobbyId }) => {
        const lobby = unoLobbies.get(lobbyId);
        if (!lobby || lobby.status !== 'playing') return;
        const state = lobby.gameState;

        const player = state.players.find(p => p.id === socket.id);
        if (!player) return;

        player.saidUno = true;
        player.pendingUnoPenalty = false;
        player.sessionStats.successfulUnos += 1;

        io.to(lobbyId).emit('uno:unoCalled', { username: player.username });
    });

    // ── Challenge UNO (catch someone who didn't say UNO) ──
    socket.on('uno:challengeUno', ({ lobbyId, targetId }) => {
        const lobby = unoLobbies.get(lobbyId);
        if (!lobby || lobby.status !== 'playing') return;
        const state = lobby.gameState;

        const target = state.players.find(p => p.id === targetId);
        if (!target || target.hand.length !== 1 || !target.pendingUnoPenalty) return;

        // Penalty: target draws 2
        const drawn = drawCards(state, 2);
        target.hand.push(...drawn);
        target.pendingUnoPenalty = false;
        target.sessionStats.failedUnos += 1;

        broadcastState(io, lobby);
        io.to(lobbyId).emit('uno:unoPenalty', { username: target.username, penaltyCards: 2 });
    });

    // ── Challenge Wild Draw Four ──
    socket.on('uno:challengeWildFour', ({ lobbyId }) => {
        const lobby = unoLobbies.get(lobbyId);
        if (!lobby || lobby.status !== 'playing') return;
        const state = lobby.gameState;

        const challengerIdx = state.players.findIndex(p => p.id === socket.id);
        const prevIdx = ((state.turnIndex - state.direction) % state.players.length + state.players.length) % state.players.length;
        const prevPlayer = state.players[prevIdx];
        const challenger = state.players[challengerIdx];

        // Check if prev player had any playable card of the previous color
        // We check against the card BEFORE the wild4 (second to last in discard)
        const priorTopCard = state.discardPile[state.discardPile.length - 2];
        const priorColor = priorTopCard ? priorTopCard.color : null;

        const hadPlayable = priorColor
            ? prevPlayer.hand.some(c => c.color === priorColor || c.type === 'wild')
            : false;

        if (hadPlayable) {
            // Challenge SUCCESS: prev player draws 4, challenger doesn't
            const drawn = drawCards(state, 4);
            prevPlayer.hand.push(...drawn);
            state.drawAccumulator = 0;
            io.to(lobbyId).emit('uno:challengeResult', { success: true, challenger: challenger.username, target: prevPlayer.username });
        } else {
            // Challenge FAILED: challenger draws 6
            const drawn = drawCards(state, 6);
            challenger.hand.push(...drawn);
            state.drawAccumulator = 0;
            io.to(lobbyId).emit('uno:challengeResult', { success: false, challenger: challenger.username, target: prevPlayer.username });
        }

        state.turnIndex = nextPlayerIndex(state, 0);
        broadcastState(io, lobby);
    });

    // ── Kick from UNO Lobby ──
    socket.on('uno:kickPlayer', ({ lobbyId, targetId }) => {
        const lobby = unoLobbies.get(lobbyId);
        if (!lobby || lobby.hostId !== socket.id) return;
        const idx = lobby.players.findIndex(p => p.id === targetId);
        if (idx === -1) return;
        const removed = lobby.players.splice(idx, 1)[0];
        io.to(removed.id).emit('uno:kicked');
        io.sockets.sockets.get(removed.id)?.leave(lobbyId);
        io.to(lobbyId).emit('uno:playerJoined', { players: lobby.players });
    });

    // ── Request current game state (called by client on mount to recover missed state) ──
    socket.on('uno:requestGameState', ({ lobbyId }) => {
        const lobby = unoLobbies.get(lobbyId);
        if (!lobby || !lobby.gameState) return;
        const playerIdx = lobby.players.findIndex(p => p.id === socket.id);
        if (playerIdx === -1) return;
        socket.emit('uno:gameStateUpdate', buildPrivateState(lobby.gameState, playerIdx));
    });

    socket.on('disconnect', () => {
        // Cleanup handled implicitly; could add lobby cleanup logic here
    });
}

// ─── Effect applicator ────────────────────────────────────────────────────────
function applyCardEffect(io, lobby, card, playerIdx, colorAlreadyResolved = false) {
    const state = lobby.gameState;
    const lobbyId = lobby.id;
    const player = state.players[playerIdx];

    // ── Check win condition ──
    if (player.hand.length === 0) {
        player.finished = true;
        player.saidUno = false;
        updateUserStats(player.username, 'win', {
            game: 'uno',
            sessionStats: player.sessionStats
        }).catch(() => { });

        const active = state.players.filter(p => !p.finished);
        if (active.length === 1) {
            // Game over — only one player left (the loser)
            active[0].finished = true;
            state.gameOver = true;
            lobby.status = 'finished';
            updateUserStats(active[0].username, 'loss', {
                game: 'uno',
                sessionStats: active[0].sessionStats,
                winner: player.username
            }).catch(() => { });

            broadcastState(io, lobby);
            io.to(lobbyId).emit('uno:gameOver', {
                winner: { username: player.username, avatar: player.avatar },
                loser: { username: active[0].username },
            });
            unoLobbies.delete(lobbyId);
            return;
        }

        broadcastState(io, lobby);
        io.to(lobbyId).emit('uno:playerFinished', { username: player.username });
        // Continue game with remaining players
    }

    switch (card.type) {
        case 'skip': {
            state.turnIndex = nextPlayerIndex(state, 1); // skip next player
            break;
        }
        case 'reverse': {
            if (state.players.filter(p => !p.finished).length === 2) {
                // In 2-player, Reverse acts as Skip
                state.turnIndex = nextPlayerIndex(state, 1);
            } else {
                state.direction *= -1;
                state.turnIndex = nextPlayerIndex(state, 0);
            }
            break;
        }
        case 'draw2': {
            // Stack or force
            if (state.drawAccumulator > 0) {
                state.drawAccumulator += 2; // stacked
            } else {
                state.drawAccumulator += 2;
            }
            state.turnIndex = nextPlayerIndex(state, 0);
            // Next player must stack or draw
            break;
        }
        case 'wild': {
            state.turnIndex = nextPlayerIndex(state, 0);
            break;
        }
        case 'wild4': {
            state.drawAccumulator += 4;
            state.turnIndex = nextPlayerIndex(state, 0);
            break;
        }
        default: {
            // Normal number card
            state.turnIndex = nextPlayerIndex(state, 0);
        }
    }

    broadcastState(io, lobby);
    io.to(lobbyId).emit('uno:cardPlayed', {
        playerIdx,
        card: { ...card },
        currentColor: state.currentColor,
        nextTurnIndex: state.turnIndex,
        drawAccumulator: state.drawAccumulator,
    });
}
