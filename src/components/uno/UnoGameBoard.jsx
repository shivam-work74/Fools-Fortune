import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import UnoCard, { ColorIndicator } from "./UnoCard";
import UnoWinnerModal from "./UnoWinnerModal";

// ─── Color Picker Modal ───────────────────────────────────────────────────────
const COLORS = ['red', 'blue', 'green', 'yellow'];
const COLOR_CLASSES = {
    red: 'bg-red-600 hover:bg-red-500 shadow-red-500/50',
    blue: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/50',
    green: 'bg-green-600 hover:bg-green-500 shadow-green-500/50',
    yellow: 'bg-yellow-500 hover:bg-yellow-400 shadow-yellow-500/50',
};
const COLOR_ICONS = { red: '❤️', blue: '💙', green: '💚', yellow: '💛' };

function ColorPicker({ onChoose }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
            <div className="bg-black/90 border border-white/10 rounded-3xl p-10 text-center shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-2 font-serif">Choose a Color</h3>
                <p className="text-gray-400 text-sm font-sans mb-8 tracking-widest uppercase">Your wild card awaits</p>
                <div className="grid grid-cols-2 gap-5">
                    {COLORS.map(c => (
                        <motion.button
                            key={c}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onChoose(c)}
                            className={`w-24 h-24 rounded-2xl ${COLOR_CLASSES[c]} shadow-lg flex flex-col items-center justify-center gap-2 font-bold uppercase tracking-wider text-white text-sm transition-all`}
                        >
                            <span className="text-3xl">{COLOR_ICONS[c]}</span>
                            {c}
                        </motion.button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

// ─── Opponent Display (top / sides) ──────────────────────────────────────────
function OpponentZone({ player, isTurn, position = 'top' }) {
    const isTop = position === 'top';
    const isLeft = position === 'left';
    const isRight = position === 'right';

    // Fan of face-down cards
    const cardCount = player.handCount || 0;
    const maxDisplay = Math.min(cardCount, 7);
    const angles = Array.from({ length: maxDisplay }, (_, i) => {
        const range = Math.min((maxDisplay - 1) * 10, 50);
        return -range / 2 + (i / Math.max(maxDisplay - 1, 1)) * range;
    });

    return (
        <div className={`flex flex-col items-center gap-2 ${isLeft || isRight ? 'flex-col' : ''}`}>
            {/* Avatar + Name */}
            <div className={`flex items-center gap-2 ${isTurn ? 'text-yellow-400' : 'text-gray-400'}`}>
                <motion.div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xl ${isTurn ? 'border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'border-white/10'}`}
                    animate={isTurn ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1 }}
                >
                    {player.avatar}
                </motion.div>
                <div className="text-center">
                    <div className="text-xs font-bold truncate max-w-[80px]">{player.username}</div>
                    <div className="text-[10px] font-sans uppercase tracking-wider text-gray-500">{cardCount} cards</div>
                </div>
                {isTurn && (
                    <motion.div
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="text-yellow-400 text-xs font-sans font-bold"
                    >●</motion.div>
                )}
            </div>

            {/* Face-down card fan */}
            <div className="relative flex items-center justify-center" style={{ height: 56, width: Math.max(maxDisplay, 1) * 14 + 40 }}>
                {Array.from({ length: maxDisplay }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="absolute"
                        style={{ rotate: angles[i] || 0, left: i * 14, transformOrigin: 'bottom center' }}
                    >
                        <UnoCard card={{ color: 'wild' }} faceDown small />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// ─── UNO Button ──────────────────────────────────────────────────────────────
function UnoButton({ onSayUno, disabled }) {
    const [clicked, setClicked] = useState(false);
    const handleClick = () => {
        if (disabled) return;
        setClicked(true);
        onSayUno();
        setTimeout(() => setClicked(false), 1500);
    };
    return (
        <motion.button
            onClick={handleClick}
            whileHover={!disabled ? { scale: 1.1, rotate: [-2, 2, -2, 0] } : {}}
            whileTap={!disabled ? { scale: 0.9 } : {}}
            disabled={disabled}
            className={`relative w-20 h-12 rounded-2xl font-black text-xl tracking-tighter shadow-2xl transition-all
                ${clicked ? 'bg-green-500 shadow-green-500/50' : 'bg-gradient-to-br from-red-600 to-red-800 shadow-red-500/40'}
                ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:shadow-[0_0_25px_rgba(239,68,68,0.6)]'}
                border-2 ${clicked ? 'border-green-300' : 'border-red-400/60'}
            `}
        >
            <span className="relative text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                {clicked ? '✓' : 'UNO!'}
            </span>
        </motion.button>
    );
}

// ─── Floating Toast notification ──────────────────────────────────────────────
function Toast({ message, color = 'yellow' }) {
    const colors = {
        yellow: 'bg-yellow-900/80 border-yellow-500/50 text-yellow-100',
        red: 'bg-red-900/80 border-red-500/50 text-red-100',
        green: 'bg-green-900/80 border-green-500/50 text-green-100',
        blue: 'bg-blue-900/80 border-blue-500/50 text-blue-100',
    };
    return (
        <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl border backdrop-blur-sm font-serif text-lg font-bold shadow-xl ${colors[color]}`}
        >
            {message}
        </motion.div>
    );
}

// ─── Main Game Board ──────────────────────────────────────────────────────────
export default function UnoGameBoard() {
    const { lobbyId } = useParams();
    const { user } = useAuth();
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

    const addToast = useCallback((message, color = 'yellow') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, color }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    }, []);

    const applyState = useCallback((state) => {
        setGameState(state);
        setMyHand(state.myHand || []);
        setTopCard(state.topCard);
        setCurrentColor(state.currentColor);
        setDrawPileCount(state.drawPileCount);
        setDrawAccumulator(state.drawAccumulator || 0);
        setPlayers(state.players || []);

        // Find myIndex
        const idx = (state.players || []).findIndex(p => p.username === user.username);
        setMyIndex(idx);
        setMyTurn(idx === state.turnIndex);
    }, [user.username]);

    useEffect(() => {
        if (!socket || !lobbyId) return;

        socket.on('uno:gameStateUpdate', applyState);

        // Request current state immediately in case we missed the initial broadcast
        // (race condition: server emits state before client finishes navigating)
        socket.emit('uno:requestGameState', { lobbyId });

        socket.on('uno:cardPlayed', ({ card, currentColor: cc, drawAccumulator: da }) => {
            setLastPlayedCard(card);
            setCurrentColor(cc);
            setDrawAccumulator(da || 0);
        });

        socket.on('uno:chooseColor', () => {
            setShowColorPicker(true);
        });

        socket.on('uno:gameOver', ({ winner: w }) => {
            setWinner(w);
        });

        socket.on('uno:unoCalled', ({ username }) => {
            addToast(`🔔 ${username} says UNO!`, 'red');
        });

        socket.on('uno:unoPenalty', ({ username, penaltyCards }) => {
            addToast(`⚠️ ${username} forgot UNO! +${penaltyCards} cards`, 'red');
        });

        socket.on('uno:challengeResult', ({ success, challenger, target }) => {
            if (success) {
                addToast(`⚡ ${challenger} challenged ${target} — SUCCESS! ${target} draws 4`, 'green');
            } else {
                addToast(`⚡ ${challenger} challenged ${target} — FAILED! ${challenger} draws 6`, 'red');
            }
        });

        socket.on('uno:playerFinished', ({ username }) => {
            addToast(`🎉 ${username} is out! (winner)`, 'green');
        });

        socket.on('uno:error', (err) => addToast(`⛔ ${err}`, 'red'));

        return () => {
            socket.off('uno:gameStateUpdate');
            socket.off('uno:cardPlayed');
            socket.off('uno:chooseColor');
            socket.off('uno:gameOver');
            socket.off('uno:unoCalled');
            socket.off('uno:unoPenalty');
            socket.off('uno:challengeResult');
            socket.off('uno:playerFinished');
            socket.off('uno:error');
        };
    }, [socket, lobbyId, applyState, addToast]);

    // ── Determine playable cards ──
    const playableCardIds = React.useMemo(() => {
        if (!myTurn || !topCard) return new Set();
        const s = new Set();

        // If draw accumulator is active, can only stack same type
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

    const handleDraw = () => {
        if (!myTurn) return;
        socket.emit('uno:drawCard', { lobbyId });
    };

    const handleSayUno = () => {
        setMySaidUno(true);
        socket.emit('uno:sayUno', { lobbyId });
    };

    const handleChallengeUno = (targetId) => {
        socket.emit('uno:challengeUno', { lobbyId, targetId });
    };

    const handleChallengWD4 = () => {
        socket.emit('uno:challengeWildFour', { lobbyId });
    };

    if (!gameState) {
        return (
            <div className="min-h-screen bg-plush flex items-center justify-center">
                <div className="text-amber-100/60 font-serif text-xl animate-pulse">Dealing cards...</div>
            </div>
        );
    }

    // ── Organize opponents around the table ──
    const me = players[myIndex];
    const opponents = players.filter((_, i) => i !== myIndex);

    // Layout: top up to 2, left/right for more
    const topOpponents = opponents.slice(0, Math.min(opponents.length, 2));
    const bottomOpponents = opponents.slice(2);

    const colorGlow = {
        red: 'shadow-[0_0_60px_rgba(239,68,68,0.25)]',
        blue: 'shadow-[0_0_60px_rgba(59,130,246,0.25)]',
        green: 'shadow-[0_0_60px_rgba(34,197,94,0.25)]',
        yellow: 'shadow-[0_0_60px_rgba(234,179,8,0.25)]',
        wild: 'shadow-[0_0_60px_rgba(255,255,255,0.1)]',
    };

    return (
        <div className="min-h-screen bg-plush text-amber-50 font-serif flex flex-col relative overflow-hidden">
            {/* Toast notifications */}
            <AnimatePresence>
                {toasts.map(t => <Toast key={t.id} message={t.message} color={t.color} />)}
            </AnimatePresence>

            {/* Color Picker Modal */}
            <AnimatePresence>
                {showColorPicker && <ColorPicker onChoose={handleColorChosen} />}
            </AnimatePresence>

            {/* Winner Modal */}
            {winner && <UnoWinnerModal winner={winner} onClose={() => navigate('/dashboard')} />}

            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
                <div className={`absolute inset-0 opacity-50 transition-all duration-700 ${colorGlow[currentColor] || ''}`} />
                <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
            </div>

            {/* ── Header Bar ── */}
            <div className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-4 bg-black/40 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                        {['red', 'blue', 'green', 'yellow'].map(c => (
                            <div key={c} className={`w-2 h-6 rounded-sm ${c === 'red' ? 'bg-red-500' : c === 'blue' ? 'bg-blue-500' : c === 'green' ? 'bg-green-500' : 'bg-yellow-400'}`} />
                        ))}
                    </div>
                    <span className="font-black text-2xl tracking-tight">
                        <span className="text-red-500">U</span><span className="text-blue-500">N</span><span className="text-green-500">O</span>
                    </span>
                </div>

                {/* Turn indicator */}
                <div className="text-center">
                    {myTurn ? (
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="text-yellow-400 font-bold text-sm font-sans uppercase tracking-widest"
                        >
                            ⚡ Your Turn
                        </motion.div>
                    ) : (
                        <div className="text-gray-400 text-xs font-sans uppercase tracking-widest">
                            {players[gameState.turnIndex]?.username}'s turn
                        </div>
                    )}
                </div>

                {/* Current color + direction */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <ColorIndicator color={currentColor} size={16} />
                        <span className="text-xs font-sans uppercase tracking-widest text-gray-400">{currentColor}</span>
                    </div>
                    <div className="text-xl" title="Direction">{gameState.direction === 1 ? '→' : '←'}</div>
                    {drawAccumulator > 0 && (
                        <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg font-sans animate-pulse">
                            +{drawAccumulator} PENDING
                        </div>
                    )}
                </div>
            </div>

            {/* ── Main Table Area ── */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-between px-4 py-4 gap-3">

                {/* Opponents - Top */}
                <div className="flex gap-6 sm:gap-10 justify-center flex-wrap w-full">
                    {topOpponents.map((p, i) => (
                        <div key={p.username} className="relative">
                            <OpponentZone player={p} isTurn={players.indexOf(p) === gameState.turnIndex} position="top" />
                            {/* Challenge UNO button */}
                            {p.handCount === 1 && !p.saidUno && (
                                <motion.button
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ repeat: Infinity, duration: 0.8 }}
                                    onClick={() => handleChallengeUno(p.id)}
                                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg hover:bg-red-500 transition-colors font-sans"
                                >
                                    CATCH!
                                </motion.button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Center Table */}
                <div className="flex-1 flex items-center justify-center gap-6 sm:gap-10 w-full">
                    {/* Draw Pile */}
                    <div className="relative flex flex-col items-center gap-2">
                        <motion.div
                            onClick={myTurn ? handleDraw : undefined}
                            whileHover={myTurn ? { scale: 1.05, rotate: -3 } : {}}
                            whileTap={myTurn ? { scale: 0.95 } : {}}
                            className={`relative cursor-${myTurn ? 'pointer' : 'default'}`}
                        >
                            {/* Stack illusion */}
                            <div className="absolute top-1 left-1 w-20 h-28 sm:w-24 sm:h-32 bg-gray-800 rounded-xl border border-gray-700" />
                            <div className="absolute top-0.5 left-0.5 w-20 h-28 sm:w-24 sm:h-32 bg-gray-900 rounded-xl border border-gray-700" />
                            <UnoCard card={{ color: 'wild' }} faceDown playable={myTurn} />
                            {myTurn && drawAccumulator > 0 && (
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 0.7 }}
                                    className="absolute -top-3 -right-3 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-sans border-2 border-red-400 shadow-lg"
                                >
                                    +{drawAccumulator}
                                </motion.div>
                            )}
                        </motion.div>
                        <span className="text-xs text-gray-500 font-sans">{drawPileCount} cards</span>
                        {myTurn && drawAccumulator === 0 && (
                            <span className="text-xs text-yellow-500/60 font-sans animate-pulse">tap to draw</span>
                        )}
                        {myTurn && drawAccumulator > 0 && (
                            <span className="text-xs text-red-400 font-sans animate-pulse">draw {drawAccumulator}!</span>
                        )}
                    </div>

                    {/* Current Top Card */}
                    <div className="flex flex-col items-center gap-3">
                        {/* Color halo */}
                        <div className="relative">
                            <AnimatePresence mode="wait">
                                {topCard && (
                                    <motion.div
                                        key={topCard.id}
                                        initial={{ scale: 0.3, rotate: -180, opacity: 0, y: -50 }}
                                        animate={{ scale: 1, rotate: 0, opacity: 1, y: 0 }}
                                        exit={{ scale: 0.5, opacity: 0 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    >
                                        <UnoCard card={topCard} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="flex items-center gap-2">
                            <ColorIndicator color={currentColor} size={12} />
                            <span className="text-xs font-sans uppercase tracking-widest text-gray-400">{currentColor} active</span>
                        </div>

                        {/* WD4 Challenge button (show if top card is wild4 and it's my turn) */}
                        {topCard?.type === 'wild4' && myTurn && (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={handleChallengWD4}
                                className="text-xs bg-orange-600/80 hover:bg-orange-500 text-white px-3 py-1 rounded-lg font-sans font-bold uppercase tracking-wider border border-orange-400/50 transition-colors"
                            >
                                Challenge +4
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Bottom opponents if > 2 opponents */}
                {bottomOpponents.length > 0 && (
                    <div className="flex gap-6 justify-center">
                        {bottomOpponents.map(p => (
                            <OpponentZone key={p.username} player={p} isTurn={players.indexOf(p) === gameState.turnIndex} />
                        ))}
                    </div>
                )}

                {/* ── Player Hand ── */}
                <div className="w-full">
                    {/* UNO button + Hand label row */}
                    <div className="flex items-center justify-between px-2 mb-3">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${myTurn ? 'border-yellow-400' : 'border-white/10'}`}>
                                {me?.avatar || '🃏'}
                            </div>
                            <div>
                                <span className="font-bold text-sm">{user.username}</span>
                                <span className="text-gray-500 text-xs font-sans ml-2">({myHand.length} cards)</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {myHand.length === 1 && (
                                <UnoButton onSayUno={handleSayUno} disabled={mySaidUno} />
                            )}
                            {!myTurn && (
                                <span className="text-xs text-gray-600 font-sans uppercase tracking-widest">Waiting...</span>
                            )}
                        </div>
                    </div>

                    {/* Card Fan */}
                    <div className="relative overflow-x-auto pb-2">
                        <div className="flex items-end justify-center gap-1 sm:gap-1.5 min-w-max mx-auto px-4" style={{ minHeight: 140 }}>
                            <AnimatePresence>
                                {myHand.map((card, i) => {
                                    const playable = playableCardIds.has(card.id);
                                    const totalCards = myHand.length;
                                    const angle = totalCards > 1 ? -15 + (30 / (totalCards - 1)) * i : 0;
                                    const lift = totalCards > 1 ? -Math.abs(i - (totalCards - 1) / 2) * 2 : 0;
                                    return (
                                        <motion.div
                                            key={card.id}
                                            layout
                                            initial={{ y: 80, opacity: 0, rotate: 0 }}
                                            animate={{ y: lift, opacity: 1, rotate: angle }}
                                            exit={{ y: -80, opacity: 0, scale: 0.5, rotate: angle * 3 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 25, delay: i * 0.03 }}
                                            style={{ transformOrigin: 'bottom center', zIndex: playable ? myHand.length + 10 : i }}
                                        >
                                            <UnoCard
                                                card={card}
                                                playable={playable}
                                                onClick={() => handlePlayCard(card)}
                                            />
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Playability hint */}
                    {myTurn && playableCardIds.size === 0 && drawAccumulator === 0 && (
                        <p className="text-center text-yellow-500/60 text-xs font-sans mt-1 animate-pulse uppercase tracking-widest">
                            No playable cards — tap the deck to draw
                        </p>
                    )}
                    {myTurn && drawAccumulator > 0 && playableCardIds.size === 0 && (
                        <p className="text-center text-red-400 text-xs font-sans mt-1 animate-pulse uppercase tracking-widest">
                            No stackable card — tap the deck to draw {drawAccumulator}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
