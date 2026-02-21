import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import { useVoice } from "../../context/VoiceContext";
import { motion, AnimatePresence } from "framer-motion";
import UnoCard, { ColorIndicator } from "./UnoCard";
import UnoWinnerModal from "./UnoWinnerModal";
import { EmoteSelector, EmoteOverlay } from "./EmoteSystem";

// ─── Color Picker Modal ───────────────────────────────────────────────────────
const COLORS = ['red', 'blue', 'green', 'yellow'];
const COLOR_CLASSES = {
    red: 'bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/40',
    blue: 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-blue-500/40',
    green: 'bg-gradient-to-br from-green-500 to-green-700 shadow-green-500/40',
    yellow: 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-yellow-500/40',
};
const COLOR_LABELS = { red: 'Royal Red', blue: 'Azure Blue', green: 'Emerald Green', yellow: 'Golden Sun' };

function ColorPicker({ onChoose }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--bg-glass)] backdrop-blur-xl"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[40px] p-12 text-center shadow-[0_40px_100px_rgba(0,0,0,0.8)] max-w-md w-full relative"
            >
                <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                <h3 className="text-4xl font-black text-[var(--text-primary)] mb-2 tracking-tighter">CHOOSE DESTINY</h3>
                <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.4em] mb-10">Select the next house color</p>

                <div className="grid grid-cols-2 gap-6">
                    {COLORS.map(c => (
                        <motion.button
                            key={c}
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onChoose(c)}
                            className={`group relative h-32 rounded-3xl ${COLOR_CLASSES[c]} border border-white/20 flex flex-col items-center justify-center gap-2 p-4 transition-all overflow-hidden`}
                        >
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-12 h-12 rounded-full bg-white/30 border border-white/50 mb-1" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/90">{COLOR_LABELS[c]}</span>
                        </motion.button>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Opponent Display ────────────────────────────────────────────────────────
function OpponentZone({ player, isTurn, position = 'top' }) {
    const { streams, isSpeaking } = useVoice();
    const speaking = isSpeaking[player.peerId];
    const hasVoice = streams[player.peerId];

    const cardCount = player.handCount || 0;
    const maxDisplay = Math.min(cardCount, 8);
    const angles = Array.from({ length: maxDisplay }, (_, i) => {
        const span = Math.min((maxDisplay - 1) * 8, 40);
        return -span / 2 + (i / Math.max(maxDisplay - 1, 1)) * span;
    });

    return (
        <div id={`opponent-card-${player.username}`} className="flex flex-col items-center gap-4">
            {/* Premium Profile Card */}
            <motion.div
                animate={isTurn ? { y: [0, -5, 0] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`relative flex items-center gap-4 bg-[var(--bg-glass)] backdrop-blur-md border ${isTurn ? 'border-amber-500/50 shadow-[0_10px_30px_rgba(245,158,11,0.2)]' : 'border-[var(--border-glass)]'} rounded-2xl p-3 pr-6 transition-all shadow-sm`}
            >
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-[var(--border-primary)] bg-[var(--bg-secondary)] flex items-center justify-center text-2xl z-10 relative shadow-inner">
                        {player.avatar}
                    </div>
                    {isTurn && (
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="absolute inset-0 bg-amber-500 rounded-full blur-md -z-1"
                        />
                    )}
                    {speaking && (
                        <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="absolute -inset-1 border-2 border-green-500 rounded-full z-0"
                        />
                    )}
                    {hasVoice && (
                        <div className="absolute -bottom-1 -left-1 bg-green-500 rounded-full w-4 h-4 flex items-center justify-center text-[8px] border border-black z-20">
                            🎙️
                        </div>
                    )}
                </div>
                <div>
                    <div className="text-sm font-black text-[var(--text-primary)] tracking-tight">{player.username}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                        <div className="h-1 w-12 bg-[var(--border-primary)] rounded-full overflow-hidden">
                            <div className="h-full bg-red-500" style={{ width: `${(cardCount / 15) * 100}%` }} />
                        </div>
                        <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">{cardCount} Cards</span>
                    </div>
                </div>
            </motion.div>

            {/* Floating Card Fan */}
            <div className="relative h-12 flex justify-center items-end" style={{ width: 140 }}>
                <AnimatePresence>
                    {Array.from({ length: maxDisplay }).map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.5, y: 10 }}
                            animate={{ opacity: 1, scale: 0.7, y: 0 }}
                            className="absolute bottom-0"
                            style={{
                                rotate: angles[i],
                                x: (i - (maxDisplay - 1) / 2) * 10,
                                transformOrigin: 'bottom center',
                                zIndex: i
                            }}
                        >
                            <UnoCard card={{ color: 'wild' }} faceDown small />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

// ─── Floating Toast notification ──────────────────────────────────────────────
function Toast({ message, color = 'yellow' }) {
    const colors = {
        yellow: 'from-amber-500/20 to-transparent border-amber-500/30 text-amber-200',
        red: 'from-red-600/20 to-transparent border-red-500/30 text-red-200',
        green: 'from-green-600/20 to-transparent border-green-500/30 text-green-200',
        blue: 'from-blue-600/20 to-transparent border-blue-500/30 text-blue-200',
    };
    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-l-4 bg-gradient-to-r backdrop-blur-xl font-black text-sm uppercase tracking-widest shadow-2xl ${colors[color]}`}
        >
            <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {message}
        </motion.div>
    );
}

function MovingCardOverlay({ movingCard }) {
    if (!movingCard) return null;
    const { fromRect, toRect, card } = movingCard;

    return (
        <motion.div
            initial={{
                position: 'fixed',
                top: fromRect.top,
                left: fromRect.left,
                width: fromRect.width,
                height: fromRect.height,
                zIndex: 9999,
                rotate: 0,
            }}
            animate={{
                top: toRect.top + (toRect.height / 2) - (fromRect.height / 2),
                left: toRect.left + (toRect.width / 2) - (fromRect.width / 2),
                rotate: 360,
                scale: [1, 1.2, 1],
            }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            style={{ pointerEvents: 'none' }}
        >
            <UnoCard card={card} small={fromRect.width < 80} />
        </motion.div>
    );
}

// ─── Main Game Board ──────────────────────────────────────────────────────────
export default function UnoGameBoard() {
    const { lobbyId } = useParams();
    const { user } = useAuth();
    const { isMuted, toggleMute, isSpeaking, isSpeakerEnabled, toggleSpeaker, repairAudio } = useVoice();
    const socket = useSocket();
    const navigate = useNavigate();

    const [gameState, setGameState] = useState(null);
    const [myHand, setMyHand] = useState([]);
    const [topCard, setTopCard] = useState(null);
    const [currentColor, setCurrentColor] = useState(null);
    const [myTurn, setMyTurn] = useState(false);
    const [myIndex, setMyIndex] = useState(-1);
    const [drawPileCount, setDrawPileCount] = useState(0);
    const [players, setPlayers] = useState([]);

    const [showColorPicker, setShowColorPicker] = useState(false);
    const [pendingCard, setPendingCard] = useState(null);
    const [winner, setWinner] = useState(null);
    const [toasts, setToasts] = useState([]);
    const [lastPlayedCard, setLastPlayedCard] = useState(null);
    const [drawAccumulator, setDrawAccumulator] = useState(0);
    const [mySaidUno, setMySaidUno] = useState(false);
    const [movingCard, setMovingCard] = useState(null); // { fromRect, toRect, card, id }

    const addToast = useCallback((message, color = 'yellow') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, color }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);

    const applyState = useCallback((state) => {
        setGameState(state);
        setMyHand(state.myHand || []);
        setTopCard(state.topCard);
        setCurrentColor(state.currentColor);
        setDrawPileCount(state.drawPileCount);
        setDrawAccumulator(state.drawAccumulator || 0);
        setPlayers(state.players || []);

        const idx = (state.players || []).findIndex(p => p.username === user.username);
        setMyIndex(idx);
        setMyTurn(idx === state.turnIndex);
    }, [user.username]);

    useEffect(() => {
        if (!socket || !lobbyId) return;
        socket.on('uno:gameStateUpdate', applyState);
        socket.emit('uno:requestGameState', { lobbyId });

        socket.on('uno:cardPlayed', ({ playerIdx, card, currentColor: cc, drawAccumulator: da }) => {
            setLastPlayedCard(card);
            setCurrentColor(cc);
            setDrawAccumulator(da || 0);

            // Animate Play
            const player = players[playerIdx];
            if (player) {
                const isMe = player.username === user.username;
                const fromId = isMe ? `local-card-${card.id}` : `opponent-card-${player.username}`;
                animateMove(fromId, 'discard-pile', card);
            }
        });

        socket.on('uno:cardDrawn', ({ playerIdx, drawCount }) => {
            const player = players[playerIdx];
            if (player) {
                const toId = player.username === user.username ? 'local-hand' : `opponent-card-${player.username}`;
                // We don't know the exact card for opponents, just animate a card back
                for (let i = 0; i < Math.min(drawCount, 3); i++) {
                    setTimeout(() => {
                        animateMove('draw-pile', toId, { color: 'wild' });
                    }, i * 150);
                }
            }
        });

        socket.on('uno:chooseColor', () => setShowColorPicker(true));
        socket.on('uno:gameOver', ({ winner: w }) => setWinner(w));
        socket.on('uno:unoCalled', ({ username }) => addToast(`🔔 ${username} declares UNO!`, 'red'));
        socket.on('uno:unoPenalty', ({ username, penaltyCards }) => addToast(`⚠️ ${username} forgot! +${penaltyCards} cards`, 'red'));
        socket.on('uno:challengeResult', ({ success, challenger, target }) => {
            if (success) addToast(`⚡ CHALLENGE SUCCESS! ${target} draws 4`, 'green');
            else addToast(`⚡ CHALLENGE FAILED! ${challenger} draws 6`, 'red');
        });
        socket.on('uno:playerFinished', ({ username }) => addToast(`🏆 ${username} has finished!`, 'green'));
        socket.on('uno:error', (err) => addToast(`⛔ ${err}`, 'red'));

        return () => {
            socket.off('uno:gameStateUpdate');
            socket.off('uno:cardPlayed');
            socket.off('uno:cardDrawn');
            socket.off('uno:chooseColor');
            socket.off('uno:gameOver');
            socket.off('uno:unoCalled');
            socket.off('uno:unoPenalty');
            socket.off('uno:challengeResult');
            socket.off('uno:playerFinished');
            socket.off('uno:error');
        };
    }, [socket, lobbyId, applyState, addToast, players, user.username]);

    const animateMove = (fromId, toId, card) => {
        const fromEl = document.getElementById(fromId) || (fromId === 'local-hand' ? document.querySelector('[id^="local-card-"]') : null);
        const toEl = document.getElementById(toId);

        if (fromEl && toEl) {
            const fromRect = fromEl.getBoundingClientRect();
            const toRect = toEl.getBoundingClientRect();

            setMovingCard({
                fromRect,
                toRect,
                card,
                id: Math.random()
            });

            setTimeout(() => setMovingCard(null), 800);
        }
    };

    const playableCardIds = React.useMemo(() => {
        if (!myTurn || !topCard) return new Set();
        const s = new Set();
        if (drawAccumulator > 0) {
            const stackType = topCard.type === 'draw2' ? 'draw2' : 'wild4';
            myHand.forEach(c => { if (c.type === stackType) s.add(c.id); });
            return s;
        }
        myHand.forEach(c => {
            if (c.type === 'wild' || c.type === 'wild4') { s.add(c.id); return; }
            if (c.color === currentColor) { s.add(c.id); return; }
            if (c.type === 'number' && topCard.type === 'number' && c.value === topCard.value) { s.add(c.id); return; }
            if (c.type !== 'number' && c.type === topCard.type) { s.add(c.id); return; }
        });
        return s;
    }, [myHand, myTurn, topCard, currentColor, drawAccumulator]);

    const handlePlayCard = (card) => {
        if (!myTurn || !playableCardIds.has(card.id)) return;
        if (card.type === 'wild' || card.type === 'wild4') {
            setPendingCard(card);
            setShowColorPicker(true);
            return;
        }
        socket.emit('uno:playCard', { lobbyId, cardId: card.id });
    };

    const handleColorChosen = (color) => {
        setShowColorPicker(false);
        if (pendingCard) {
            socket.emit('uno:playCard', { lobbyId, cardId: pendingCard.id, chosenColor: color });
            setPendingCard(null);
        } else {
            socket.emit('uno:chooseColor', { lobbyId, color });
        }
    };

    const handleSendEmote = (emote) => {
        if (!socket || !lobbyId) return;
        socket.emit('uno:sendEmote', { lobbyId, emote });
    };

    if (!gameState) return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                <div className="text-[var(--text-muted)] font-black text-xs uppercase tracking-[0.5em] animate-pulse">Initializing Table</div>
            </div>
        </div>
    );

    const me = players[myIndex];
    const opponents = players.filter((_, i) => i !== myIndex);
    const colorColors = {
        red: 'bg-red-600 shadow-[0_0_100px_#dc262688]',
        blue: 'bg-blue-600 shadow-[0_0_100px_#2563eb88]',
        green: 'bg-green-600 shadow-[0_0_100px_#16a34a88]',
        yellow: 'bg-yellow-400 shadow-[0_0_100px_#facc1588]',
        wild: 'bg-white/10 shadow-[0_0_100px_white]'
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans flex flex-col relative overflow-hidden perspective-1000">
            {/* Dynamic Background Lighting */}
            <div className="absolute inset-0 pointer-events-none transition-all duration-1000">
                <div className={`absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full opacity-20 blur-[150px] ${colorColors[currentColor]}`} />
                <div className={`absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full opacity-20 blur-[150px] ${colorColors[currentColor]}`} />
            </div>

            {/* Emote Handling */}
            <EmoteOverlay socket={socket} players={players} />
            <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg-primary)] opacity-40`} />

            {/* Notifications */}
            <div className="fixed top-10 right-10 z-[100] flex flex-col gap-4">
                <AnimatePresence>
                    {toasts.map(t => <Toast key={t.id} message={t.message} color={t.color} />)}
                </AnimatePresence>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showColorPicker && <ColorPicker onChoose={handleColorChosen} />}
            </AnimatePresence>
            {winner && <UnoWinnerModal winner={winner} onClose={() => navigate('/dashboard')} />}
            <MovingCardOverlay movingCard={movingCard} />

            {/* ── Header ── */}
            <div className="relative z-50 flex items-center justify-between px-10 py-6 bg-[var(--bg-secondary)]/10 backdrop-blur-xl border-b border-[var(--border-primary)]">
                <div className="flex items-center gap-6">
                    <h1 className="text-4xl font-black tracking-tighter leading-none flex items-center">
                        <span className="text-red-600 drop-shadow-[0_2px_8px_#ef444466]">U</span>
                        <span className="text-blue-600 mx-[-0.05em] drop-shadow-[0_2px_8px_#2563eb66]">N</span>
                        <span className="text-green-600 drop-shadow-[0_2px_8px_#16a34a66]">O</span>
                    </h1>
                    <div className="h-4 w-[1px] bg-[var(--border-primary)]" />
                    <div className="flex items-center gap-3">
                        <ColorIndicator color={currentColor} size={14} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)]">{currentColor} Realm</span>
                    </div>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className="text-[8px] font-black uppercase tracking-[0.5em] text-[var(--text-muted)] mb-1">Active Realm</div>
                    {myTurn ? (
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="bg-amber-500 text-black px-6 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_0_20px_#f59e0b66]"
                        >
                            Your Command
                        </motion.div>
                    ) : (
                        <div className="text-white/60 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-red-600" />
                            {players[gameState.turnIndex]?.username}'s Strategem
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Flow Direction</span>
                        <span className="text-xl leading-none text-white/80">{gameState.direction === 1 ? '↻' : '↺'}</span>
                    </div>
                    {drawAccumulator > 0 && (
                        <div className="bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl border border-white/20 shadow-[0_0_20px_#ef444466] animate-bounce">
                            +{drawAccumulator} CARDS STACKED
                        </div>
                    )}
                    <button
                        onClick={repairAudio}
                        className="bg-white/5 hover:bg-white/10 text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/10 transition-all opacity-40 hover:opacity-100"
                    >
                        Repair Audio
                    </button>

                    <EmoteSelector onSelect={handleSendEmote} />
                    <button
                        onClick={toggleMute}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all shadow-lg hover:scale-110 active:scale-95 border ${isMuted ? 'bg-red-600/40 border-red-500/50 text-white' : 'bg-green-600/40 border-green-500/50 text-white'}`}
                        title={isMuted ? "Unmute Mic" : "Mute Mic"}
                    >
                        {isMuted ? '🔇' : '🎙️'}
                    </button>
                    <button
                        onClick={toggleSpeaker}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all shadow-lg hover:scale-110 active:scale-95 border ${!isSpeakerEnabled ? 'bg-red-600/40 border-red-500/50 text-white' : 'bg-blue-600/40 border-blue-500/50 text-white'}`}
                        title={isSpeakerEnabled ? "Disable Speaker" : "Enable Speaker"}
                    >
                        {isSpeakerEnabled ? '🔊' : '🔇'}
                    </button>
                </div>
            </div>

            {/* ── Immersive Table ── */}
            <div className="relative flex-1 flex flex-col items-center justify-between p-8 pt-12 overflow-hidden">

                {/* 3D Felt Table Base */}
                <div
                    className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] aspect-[2/1] bg-[#0c1a0c] rounded-[50%] blur-[2px] opacity-80"
                    style={{
                        transform: 'translateX(-50%) translateY(-50%) perspective(1000px) rotateX(60deg)',
                        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8), 0 50px 150px rgba(0,0,0,0.9)'
                    }}
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-40 mix-blend-overlay" />
                    <div className="absolute inset-0 rounded-[50%] border-[20px] border-white/5 opacity-20" />
                </div>

                {/* Opponents Row */}
                <div className="relative z-10 flex gap-12 sm:gap-24 justify-center w-full">
                    {opponents.map((p, i) => (
                        <div key={p.username} className="relative">
                            <OpponentZone player={p} isTurn={players.indexOf(p) === gameState.turnIndex} />
                            {p.handCount === 1 && !p.saidUno && (
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    onClick={() => socket.emit('uno:challengeUno', { lobbyId, targetId: p.id })}
                                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-black px-4 py-2 rounded-2xl shadow-xl z-50 border border-white/20 uppercase tracking-widest"
                                >
                                    CATCH!
                                </motion.button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Center Cluster */}
                <div className="relative z-10 flex-1 flex items-center justify-center gap-20 w-full mb-10">
                    {/* Draw Pile */}
                    <div className="relative group">
                        <motion.div
                            onClick={myTurn ? () => socket.emit('uno:drawCard', { lobbyId }) : undefined}
                            whileHover={myTurn ? { rotateX: -10, rotateY: -10, scale: 1.05 } : {}}
                            className={`relative ${myTurn ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}`}
                            style={{ perspective: '1000px' }}
                        >
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="absolute inset-0 bg-[#111] rounded-2xl border border-white/5" style={{ transform: `translateZ(${-i * 2}px) translateY(${-i * 1}px)` }} />
                            ))}
                            <div id="draw-pile">
                                <UnoCard card={{ color: 'wild' }} faceDown playable={myTurn} />
                            </div>

                            {myTurn && drawAccumulator > 0 && (
                                <div className="absolute -top-4 -right-4 bg-red-600 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 border-white/50 shadow-2xl z-50 animate-bounce">
                                    +{drawAccumulator}
                                </div>
                            )}
                        </motion.div>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] text-center mt-6">{drawPileCount} Deck Pool</div>
                    </div>

                    {/* Discard Pile */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full scale-150 opacity-40" />
                        <AnimatePresence mode="wait">
                            {topCard && (
                                <motion.div
                                    key={topCard.id}
                                    initial={{ scale: 0.2, rotate: -45, y: -200, opacity: 0 }}
                                    animate={{ scale: 1, rotate: (Math.random() - 0.5) * 10, y: 0, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                    className="relative z-10"
                                >
                                    <div id="discard-pile">
                                        <UnoCard card={topCard} />
                                    </div>
                                    {topCard.type === 'wild4' && myTurn && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            onClick={() => socket.emit('uno:challengeWildFour', { lobbyId })}
                                            className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-blue-600 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl border border-white/20 shadow-xl"
                                        >
                                            Challenge WD4
                                        </motion.button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] text-center mt-6">Current Focus</div>
                    </div>
                </div>

                {/* Player Interaction Area */}
                <div className="relative z-20 w-full bg-gradient-to-t from-black via-black/80 to-transparent pt-12">

                    <div className="flex items-center justify-between px-16 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full border-2 border-white/10 bg-black flex items-center justify-center text-2xl">
                                    {me?.avatar || '🃏'}
                                </div>
                                {isSpeaking['local'] && (
                                    <motion.div
                                        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
                                        transition={{ repeat: Infinity, duration: 1 }}
                                        className="absolute -inset-1 border-2 border-green-500 rounded-full z-0"
                                    />
                                )}
                            </div>
                            <div>
                                <div className="text-xl font-black tracking-tight">{user.username}</div>
                                <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">Royal Deck • {myHand.length} Cards</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            {myHand.length === 1 && (
                                <motion.button
                                    whileHover={{ scale: 1.05, rotate: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => { setMySaidUno(true); socket.emit('uno:sayUno', { lobbyId }); }}
                                    disabled={mySaidUno}
                                    className={`px-10 py-3 rounded-2xl font-black text-xl tracking-[0.3em] transition-all transform skew-x-[-10deg] ${mySaidUno ? 'bg-green-600 text-white opacity-50' : 'bg-red-600 text-white shadow-[0_10px_30px_#ef444488]'}`}
                                >
                                    {mySaidUno ? 'DECLARED' : 'UNO!'}
                                </motion.button>
                            )}
                        </div>
                    </div>

                    {/* Card Fan Container */}
                    <div className="relative h-[220px] mb-[-40px]">
                        <div className="flex items-end justify-center perspective-1000 -space-x-12">
                            <AnimatePresence>
                                {myHand.map((card, i) => {
                                    const playable = playableCardIds.has(card.id);
                                    const total = myHand.length;
                                    const spread = Math.min(60 / (total || 1), 6);
                                    const angle = (i - (total - 1) / 2) * spread;
                                    const yPos = Math.abs(i - (total - 1) / 2) * 4;

                                    return (
                                        <motion.div
                                            key={card.id}
                                            layout
                                            initial={{ y: 200, opacity: 0 }}
                                            animate={{
                                                y: playable ? -20 : yPos,
                                                opacity: 1,
                                                rotate: angle,
                                                z: playable ? 100 : 0
                                            }}
                                            exit={{ y: -300, scale: 0.5, opacity: 0 }}
                                            transition={{ type: "spring", stiffness: 200, damping: 25 }}
                                            className="relative"
                                            style={{ filter: !playable && myTurn ? 'brightness(0.6) saturate(0.5)' : 'none' }}
                                        >
                                            <div id={`local-card-${card.id}`}>
                                                <UnoCard
                                                    card={card}
                                                    playable={playable}
                                                    onClick={() => handlePlayCard(card)}
                                                />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
