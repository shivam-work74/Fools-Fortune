import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOTES = [
    { id: 'laugh', char: '😂', label: 'Laugh' },
    { id: 'angry', char: '😡', label: 'Angry' },
    { id: 'like', char: '👍', label: 'Nice' },
    { id: 'uno', char: '🃏', label: 'Uno' },
    { id: 'fire', char: '🔥', label: 'Fire' },
    { id: 'skull', char: '💀', label: 'Dead' }
];

// --- Emote Selector Component ---
export function EmoteSelector({ onSelect, disabled }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg border transition-all ${isOpen
                    ? 'bg-amber-500 border-[var(--border-primary)] text-black'
                    : 'bg-[var(--bg-glass)] border-[var(--border-glass)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-primary)]'
                    } ${disabled ? 'opacity-20 cursor-not-allowed' : ''}`}
            >
                🎭
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        className="absolute bottom-full mb-4 right-0 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-2xl p-4 shadow-[var(--shadow-premium)] flex gap-3 backdrop-blur-2xl z-[200] min-w-max"
                    >
                        {EMOTES.map((emote) => (
                            <motion.button
                                key={emote.id}
                                whileHover={{ scale: 1.2, y: -4 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                    onSelect(emote.char);
                                    setIsOpen(false);
                                }}
                                className="w-10 h-10 rounded-xl bg-[var(--bg-glass)] border border-[var(--border-glass)] flex items-center justify-center text-xl hover:bg-[var(--bg-elevated)] transition-colors"
                                title={emote.label}
                            >
                                {emote.char}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// --- Emote Overlay Component ---
export function EmoteOverlay({ socket, players = [], eventName = 'uno:emoteReceived' }) {
    const [activeEmotes, setActiveEmotes] = useState([]);

    const handleEmoteReceived = useCallback(({ senderId, emote }) => {
        const id = Date.now() + Math.random();
        // Randomize the start/end positions at creation time so they are stable across renders
        const startX = senderId === socket?.id
            ? window.innerWidth * 0.75
            : window.innerWidth * 0.1 + Math.random() * window.innerWidth * 0.3;
        const endX = window.innerWidth * 0.2 + Math.random() * window.innerWidth * 0.6;

        setActiveEmotes(prev => [...prev, { id, senderId, emote, startX, endX }]);

        setTimeout(() => {
            setActiveEmotes(prev => prev.filter(e => e.id !== id));
        }, 3500);
    }, [socket]);

    useEffect(() => {
        if (!socket) return;
        socket.on(eventName, handleEmoteReceived);
        return () => socket.off(eventName, handleEmoteReceived);
    }, [socket, handleEmoteReceived, eventName]);

    return (
        // Render in a fixed full-screen layer — never clipped by overflow-hidden parents
        <div className="fixed inset-0 pointer-events-none z-[9999]">
            <AnimatePresence>
                {activeEmotes.map((e) => (
                    <EmoteInstance key={e.id} emote={e.emote} startX={e.startX} endX={e.endX} />
                ))}
            </AnimatePresence>
        </div>
    );
}

function EmoteInstance({ emote, startX, endX }) {
    const randomRotation = (Math.random() - 0.5) * 60;
    const startY = window.innerHeight * 0.85;
    const endY = window.innerHeight * 0.15;

    return (
        <motion.div
            initial={{
                opacity: 0,
                scale: 0.5,
                x: startX,
                y: startY,
                rotate: 0,
            }}
            animate={{
                opacity: [0, 1, 1, 1, 0],
                scale: [0.5, 1.3, 1.3, 1.1, 0.9],
                x: [startX, endX],
                y: [startY, endY],
                rotate: randomRotation,
            }}
            transition={{ duration: 3.2, ease: "easeOut" }}
            style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', fontSize: '3rem' }}
            className="filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
        >
            {emote}
        </motion.div>
    );
}
