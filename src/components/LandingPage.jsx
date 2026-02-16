import React from "react";
import { motion } from "framer-motion";

export default function LandingPage({ onPlay, onHowTo }) {
    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#0f172a] text-white">
            {/* Dynamic Background */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[120px] animate-blob" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/20 rounded-full blur-[120px] animate-blob animation-delay-4000" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
            </div>

            {/* Floating 3D Cards (Decorative) */}
            <motion.div
                initial={{ y: 20, rotate: -15, opacity: 0 }}
                animate={{ y: 0, rotate: -12, opacity: 0.8 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                className="absolute left-[10%] top-[20%] hidden lg:block"
            >
                <div className="w-48 h-72 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-white/10 shadow-2xl transform rotate-[-12deg] flex items-center justify-center">
                    <span className="text-6xl grayscale opacity-50">J♠</span>
                </div>
            </motion.div>

            <motion.div
                initial={{ y: 20, rotate: 15, opacity: 0 }}
                animate={{ y: 0, rotate: 12, opacity: 0.8 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                className="absolute right-[10%] bottom-[20%] hidden lg:block"
            >
                <div className="w-48 h-72 bg-gradient-to-br from-red-900 to-red-950 rounded-2xl border border-white/10 shadow-2xl transform rotate-[12deg] flex items-center justify-center">
                    <span className="text-6xl text-red-500/50">Q♥</span>
                </div>
            </motion.div>

            {/* Hero Content */}
            <div className="z-10 text-center space-y-8 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                        FOOLS FORTUNE
                    </h1>
                    <p className="mt-4 text-xl md:text-2xl text-indigo-200/80 font-light tracking-widest uppercase">
                        The Ultimate Old Maid Experience
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="flex flex-col sm:flex-row gap-6 justify-center mt-12"
                >
                    <button
                        onClick={onPlay}
                        className="group relative px-12 py-4 bg-white/10 overflow-hidden rounded-full backdrop-blur-md border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-105 hover:bg-white/20 hover:shadow-[0_0_40px_rgba(139,92,246,0.3)]"
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        <span className="relative text-lg font-bold tracking-wider">ENTER LOBBY</span>
                    </button>

                    <button
                        onClick={onHowTo}
                        className="px-12 py-4 rounded-full border border-white/10 text-indigo-200 hover:text-white hover:border-white/30 transition-all font-medium tracking-wide"
                    >
                        HOW TO PLAY
                    </button>
                </motion.div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 text-xs text-white/30 uppercase tracking-[0.2em]">
                High Stakes • High Reward • Dont be the Fool
            </div>
        </div>
    );
}
