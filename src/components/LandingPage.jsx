import React from "react";
import { motion } from "framer-motion";

export default function LandingPage({ onPlay, onHowTo }) {
    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-plush text-amber-50 font-serif">
            {/* Dynamic Background Assets */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Spotlight effect */}
                <div className="absolute top-[-50%] left-[-20%] w-[100vw] h-[100vw] bg-purple-900/20 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-30%] right-[-10%] w-[80vw] h-[80vw] bg-yellow-900/10 rounded-full blur-[120px]" />

                {/* Gold Particles (simulated with CSS/dots) */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, #fbbf24 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
            </div>

            {/* Floating 3D Cards - Premium Retouch */}
            <motion.div
                initial={{ y: 40, rotate: -15, opacity: 0 }}
                animate={{ y: 0, rotate: -12, opacity: 1 }}
                transition={{ duration: 1.8, ease: "easeOut" }}
                className="absolute left-[5%] lg:left-[15%] top-[15%] hidden md:block"
            >
                <div className="w-56 h-80 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-yellow-600/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform rotate-[-12deg] flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-50" />
                    <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-10 group-hover:animate-shimmer" />
                    <span className="relative text-7xl text-yellow-500/80 font-serif">J♠</span>
                </div>
            </motion.div>

            <motion.div
                initial={{ y: 40, rotate: 15, opacity: 0 }}
                animate={{ y: 0, rotate: 12, opacity: 1 }}
                transition={{ duration: 1.8, ease: "easeOut", delay: 0.2 }}
                className="absolute right-[5%] lg:right-[15%] bottom-[15%] hidden md:block"
            >
                <div className="w-56 h-80 bg-gradient-to-br from-red-950 to-black rounded-2xl border border-red-900/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform rotate-[12deg] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-50" />
                    <span className="relative text-7xl text-red-600/80 font-serif">Q♥</span>
                </div>
            </motion.div>

            {/* Hero Content */}
            <div className="z-10 text-center space-y-10 px-6 max-w-4xl relative">
                <div className="absolute -inset-10 bg-black/40 blur-3xl -z-10 rounded-full" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2 }}
                >
                    <div className="inline-block mb-4 px-4 py-1.5 border border-yellow-500/30 rounded-full bg-black/40 backdrop-blur-sm">
                        <span className="text-xs font-sans tracking-[0.3em] text-yellow-500/80 uppercase">The Inner Circle Awaits</span>
                    </div>

                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-gold drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] leading-tight">
                        FOOL'S<br />FORTUNE
                    </h1>

                    <p className="mt-6 text-xl md:text-2xl text-amber-100/60 font-light tracking-wide max-w-2xl mx-auto italic">
                        "Only the bold dare to sit at this table. Will you walk away with everything, or be left holding the Queen?"
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="flex flex-col sm:flex-row gap-6 justify-center mt-16"
                >
                    <button
                        onClick={onPlay}
                        className="group relative px-16 py-5 bg-gradient-to-r from-yellow-700 to-yellow-600 rounded-lg shadow-[0_0_40px_rgba(202,138,4,0.2)] hover:shadow-[0_0_60px_rgba(202,138,4,0.4)] transition-all transform hover:-translate-y-1"
                    >
                        <div className="absolute inset-0 border border-white/20 rounded-lg" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors rounded-lg" />
                        <span className="relative text-xl font-bold tracking-[0.2em] text-black font-sans flex items-center gap-3">
                            REQUEST ENTRY <span className="text-2xl">→</span>
                        </span>
                    </button>

                    <button
                        onClick={onHowTo}
                        className="px-12 py-5 rounded-lg border border-yellow-500/30 text-yellow-500/80 hover:text-yellow-400 hover:border-yellow-500/80 hover:bg-yellow-900/10 transition-all font-sans font-bold tracking-[0.2em] uppercase text-sm"
                    >
                        House Rules
                    </button>
                </motion.div>
            </div>

            {/* Footer / Status */}
            <div className="absolute bottom-10 w-full flex justify-between px-12 text-[10px] md:text-xs text-amber-500/30 uppercase tracking-[0.3em] font-sans">
                <span>EST. 2024</span>
                <span className="hidden md:inline">High Stakes • High Reward</span>
                <span>Exclusive Access</span>
            </div>
        </div>
    );
}
