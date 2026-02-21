import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function UnoWinnerModal({ winner, onClose }) {
    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Confetti particles */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {Array.from({ length: 40 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-3 h-3 rounded-sm"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `-20px`,
                                backgroundColor: ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7'][i % 5],
                            }}
                            animate={{
                                top: `110%`,
                                rotate: Math.random() * 720 - 360,
                                x: (Math.random() - 0.5) * 200,
                                opacity: [1, 1, 0],
                            }}
                            transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 1.5, ease: "easeIn" }}
                        />
                    ))}
                </div>

                <motion.div
                    initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="relative mx-4 max-w-md w-full text-center"
                >
                    <div className="bg-black/90 border border-yellow-500/40 rounded-3xl p-12 shadow-[0_0_80px_rgba(202,138,4,0.2)] backdrop-blur-xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent rounded-t-3xl" />

                        <motion.div
                            animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.2, 1.2, 1] }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="text-7xl mb-6"
                        >
                            🏆
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <p className="text-yellow-500/60 text-xs font-sans uppercase tracking-[0.4em] mb-2">UNO! Winner</p>
                            <h2 className="text-5xl font-black text-white tracking-tight mb-2">
                                {winner?.username}
                            </h2>
                            <p className="text-amber-100/50 italic font-serif text-lg mb-10">
                                Played their last card. The table falls silent.
                            </p>
                        </motion.div>

                        <motion.button
                            onClick={onClose}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            className="px-12 py-4 bg-gradient-to-r from-yellow-700 to-yellow-600 rounded-xl text-black font-bold uppercase tracking-[0.2em] text-sm shadow-lg hover:shadow-[0_0_30px_rgba(202,138,4,0.4)] transition-shadow"
                        >
                            Back to Dashboard
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
