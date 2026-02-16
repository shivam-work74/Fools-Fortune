import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AVATARS = ["😎", "🤖", "🦊", "👽", "🤠", "👻", "🦄", "🐱"];

export default function Lobby({ onStartGame, onBack }) {
    const [playerName, setPlayerName] = useState("Player 1");
    const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
    const [mode, setMode] = useState(null); // 2 or 4

    const handleStart = () => {
        if (mode && playerName) {
            onStartGame(mode, playerName, selectedAvatar);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen w-full flex items-center justify-center bg-[#0f172a] relative overflow-hidden text-white p-4 md:p-8"
        >
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-[#0f172a] to-[#0f172a]" />
            <div className="absolute w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] top-[-20%] left-[-10%] animate-pulse" />
            <div className="absolute w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] bottom-[-20%] right-[-10%]" />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-5xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
                {/* LEFT PANEL: IDENTITY */}
                <div className="w-full md:w-1/3 p-8 border-b md:border-b-0 md:border-r border-white/10 bg-black/20 flex flex-col items-center justify-center relative">
                    <button
                        onClick={onBack}
                        className="absolute top-6 left-6 text-gray-400 hover:text-white transition flex items-center gap-2 text-sm uppercase tracking-wider font-bold"
                    >
                        ← Back
                    </button>

                    <div className="mt-12 mb-8">
                        <h3 className="text-xs uppercase tracking-[0.2em] text-indigo-300 font-bold mb-6 text-center">
                            Identity Protocol
                        </h3>

                        {/* Avatar Selector */}
                        <div className="relative w-32 h-32 mx-auto mb-6 group">
                            <div className="absolute inset-0 bg-indigo-500/30 rounded-full blur-xl group-hover:bg-indigo-500/50 transition-all duration-500" />
                            <div className="relative w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-full border-2 border-white/20 flex items-center justify-center text-6xl shadow-2xl overflow-hidden">
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={selectedAvatar}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -20, opacity: 0 }}
                                    >
                                        {selectedAvatar}
                                    </motion.span>
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Avatar Grid */}
                        <div className="grid grid-cols-4 gap-2 mb-8">
                            {AVATARS.map((av) => (
                                <button
                                    key={av}
                                    onClick={() => setSelectedAvatar(av)}
                                    className={`
                    w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all
                    ${selectedAvatar === av
                                            ? "bg-indigo-600 shadow-lg scale-110 ring-2 ring-indigo-400"
                                            : "bg-white/5 hover:bg-white/10"}
                  `}
                                >
                                    {av}
                                </button>
                            ))}
                        </div>

                        {/* Name Input */}
                        <div className="space-y-2 w-full">
                            <label className="text-xs uppercase text-gray-500 font-bold ml-1">Codename</label>
                            <input
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-center font-bold text-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-gray-700"
                                placeholder="ENTER NAME"
                                maxLength={12}
                            />
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: MISSION CONTROL */}
                <div className="w-full md:w-2/3 p-8 flex flex-col relative overflow-hidden">
                    {/* Decorative Grid Background */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }}
                    />

                    <div className="relative z-10 flex-1 flex flex-col justify-center">
                        <h2 className="text-4xl md:text-5xl font-black mb-2 text-white">
                            MISSION SELECT
                        </h2>
                        <p className="text-indigo-200 mb-10 text-lg font-light">
                            Choose your engagement rules.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                            {/* Mode: Duel */}
                            <button
                                onClick={() => setMode(2)}
                                className={`
                  group relative h-64 rounded-2xl border transition-all duration-300 overflow-hidden text-left p-6 flex flex-col justify-end
                  ${mode === 2
                                        ? "bg-indigo-900/40 border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"}
                `}
                            >
                                <div className="absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded bg-black/40 text-gray-300 border border-white/10">1 VS 1</div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                                {/* Icon/Visual */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl opacity-10 group-hover:scale-110 transition-transform duration-500">
                                    ⚔️
                                </div>

                                <div className="relative z-10">
                                    <h3 className={`text-2xl font-bold mb-1 transition-colors ${mode === 2 ? "text-indigo-300" : "text-white"}`}>DUEL</h3>
                                    <p className="text-sm text-gray-400">Tactical face-off against a single rogue AI.</p>
                                </div>

                                {mode === 2 && <motion.div layoutId="mode-border" className="absolute inset-0 border-2 border-indigo-400 rounded-2xl" />}
                            </button>

                            {/* Mode: Table */}
                            <button
                                onClick={() => setMode(4)}
                                className={`
                  group relative h-64 rounded-2xl border transition-all duration-300 overflow-hidden text-left p-6 flex flex-col justify-end
                  ${mode === 4
                                        ? "bg-purple-900/40 border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.2)]"
                                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"}
                `}
                            >
                                <div className="absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded bg-black/40 text-gray-300 border border-white/10">4 PLAYERS</div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl opacity-10 group-hover:scale-110 transition-transform duration-500">
                                    🏛️
                                </div>

                                <div className="relative z-10">
                                    <h3 className={`text-2xl font-bold mb-1 transition-colors ${mode === 4 ? "text-purple-300" : "text-white"}`}>CHAOS</h3>
                                    <p className="text-sm text-gray-400">Full table mayhem with 3 unpredictable bots.</p>
                                </div>

                                {mode === 4 && <motion.div layoutId="mode-border" className="absolute inset-0 border-2 border-purple-400 rounded-2xl" />}
                            </button>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <button
                            onClick={handleStart}
                            disabled={!mode || !playerName}
                            className={`
                w-full py-5 rounded-xl font-black tracking-[0.2em] text-lg uppercase transition-all duration-300
                ${mode && playerName
                                    ? "bg-white text-black shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-[1.02] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)]"
                                    : "bg-gray-800 text-gray-600 cursor-not-allowed"}
              `}
                        >
                            Initialize Game
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
