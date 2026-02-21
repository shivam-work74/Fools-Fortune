import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function UnoWinnerModal({ winner, onClose }) {
    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--bg-glass)] backdrop-blur-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Advanced Confetti */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {Array.from({ length: 60 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `-20px`,
                                backgroundColor: ['#ef4444', '#3b82f6', '#16a34a', '#facc15', '#ffffff'][i % 5],
                                filter: 'blur(1px)'
                            }}
                            animate={{
                                top: `110%`,
                                rotate: Math.random() * 720,
                                x: (Math.random() - 0.5) * 300,
                            }}
                            transition={{
                                duration: 3 + Math.random() * 3,
                                delay: Math.random() * 2,
                                ease: "linear",
                                repeat: Infinity
                            }}
                        />
                    ))}
                </div>

                <motion.div
                    initial={{ scale: 0.8, y: 100, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 150, damping: 20 }}
                    className="relative mx-4 max-w-lg w-full text-center"
                >
                    {/* Background Glow */}
                    <div className="absolute inset-[-100px] bg-amber-500/20 rounded-full blur-[100px] pointer-events-none" />

                    <div className="relative bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[48px] p-16 shadow-[var(--shadow-premium)] overflow-hidden">
                        {/* Luxury Accents */}
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                        {/* Animated Trophy */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="relative mb-10 flex justify-center"
                        >
                            <div className="text-8xl drop-shadow-[0_0_30px_rgba(245,158,11,0.5)]">🏆</div>
                            <motion.div
                                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                                className="absolute inset-0 bg-amber-500 rounded-full blur-[40px] -z-1"
                            />
                        </motion.div>

                        <div className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500/60"
                            >
                                Grand Tournament Victory
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="text-6xl md:text-7xl font-black text-[var(--text-primary)] tracking-tighter leading-tight"
                            >
                                {winner?.username}
                            </motion.h2>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.9 }}
                                className="text-[var(--text-muted)] font-medium italic text-lg"
                            >
                                The cards played in your favor.
                            </motion.div>
                        </div>

                        {/* Controls */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2 }}
                            className="mt-16"
                        >
                            <motion.button
                                onClick={onClose}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full py-6 bg-gradient-to-r from-amber-600 to-amber-700 rounded-[24px] text-black font-black uppercase tracking-[0.4em] text-xs shadow-[0_20px_40px_rgba(217,119,6,0.2)] hover:shadow-[0_25px_50px_rgba(217,119,6,0.4)] border-t border-white/20 transition-all"
                            >
                                Return to Dashboard
                            </motion.button>
                            <p className="mt-6 text-[8px] font-black uppercase tracking-[0.3em] text-white/10">Tournament record has been updated</p>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
