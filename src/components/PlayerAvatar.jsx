import React from "react";
import { motion } from "framer-motion";

export default function PlayerAvatar({ name, isBot, cardCount, isActive, isTarget, finished, discards, avatar }) {
    return (
        <div className={`flex flex-col items-center gap-3 transition-all duration-500 ease-out ${isActive ? "scale-110 z-20" : "scale-100 z-10"} ${finished ? "opacity-60 grayscale" : ""}`}>

            {/* Avatar Circle (Glass/Coaster Style) */}
            <div className={`relative w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-black shadow-2xl overflow-visible group
        ${isActive ? "ring-4 ring-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.6)]" : "ring-4 ring-gray-700"}
        ${isTarget ? "ring-4 ring-red-500 shadow-[0_0_40px_rgba(239,68,68,0.7)] animate-pulse" : ""}
      `}>
                {/* Inner Glow/Highlight */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/50 to-white/10 pointer-events-none" />

                {/* Avatar Content */}
                <span className="text-4xl drop-shadow-md z-10 transform group-hover:scale-110 transition-transform duration-300">
                    {avatar || (isBot ? "🤖" : "👤")}
                </span>

                {/* Finished Badge */}
                {finished && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg border border-green-400 z-20">
                        SAFE
                    </div>
                )}

                {/* Active Turn Spinner */}
                {isActive && (
                    <motion.div
                        className="absolute -inset-2 rounded-full border-2 border-dashed border-yellow-300/60 pointer-events-none"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                    />
                )}
            </div>

            {/* Name & Count (Floating Label) */}
            <div className="text-center relative">
                <div className={`
                    font-bold text-sm px-4 py-1 rounded-full backdrop-blur-md border shadow-lg transition-colors duration-300
                    ${isActive
                        ? "bg-yellow-500/90 text-yellow-950 border-yellow-400"
                        : "bg-black/60 text-gray-200 border-white/10"}
                `}>
                    {name}
                </div>

                {!finished && (
                    <div className="text-xs font-semibold text-indigo-300 mt-1 drop-shadow-sm tracking-wide bg-black/40 px-2 py-0.5 rounded-md inline-block">
                        {cardCount} Cards
                    </div>
                )}
            </div>

            {/* Mini Discard/Pair Stack (Premium Tiny Cards) */}
            {discards && discards.length > 0 && (
                <div className="flex -space-x-3 mt-1 perspective-500">
                    {discards.slice(-3).map((c, i) => (
                        <div key={i}
                            className="w-6 h-9 bg-white border border-gray-300 rounded shadow-md flex items-center justify-center text-[10px] select-none transform rotate-y-12 hover:rotate-y-0 transition-transform origin-left"
                            style={{ zIndex: i }}
                        >
                            <span className={c.suit === "♥" || c.suit === "♦" ? "text-red-600" : "text-gray-900"}>
                                {c.rank}
                            </span>
                        </div>
                    ))}
                    {discards.length > 3 && (
                        <div className="w-6 h-9 bg-gray-800 border border-gray-700 rounded shadow-md flex items-center justify-center text-[8px] text-white select-none z-10">
                            +{discards.length - 3}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
