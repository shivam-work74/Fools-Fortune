import { motion, AnimatePresence } from "framer-motion";
import { useVoice } from "../context/VoiceContext";
import { useAuth } from "../context/AuthContext";

export default function PlayerAvatar({ name, isBot, cardCount, isActive, isTarget, finished, discards, avatar, peerId }) {
    const { streams, isMuted, isSpeaking } = useVoice();
    const { user } = useAuth();

    const isMe = user?.username === name;
    const voiceKey = isMe ? 'local' : peerId;
    const hasVoice = streams[voiceKey] || isMe;
    const speaking = isSpeaking[voiceKey];
    const muted = isMe && isMuted;

    return (
        <div id={`player-avatar-${name}`} className={`flex flex-col items-center gap-3 transition-all duration-500 ease-out ${isActive ? "scale-110 z-20" : "scale-100 z-10"} ${finished ? "opacity-60 grayscale" : ""}`}>

            {/* Avatar Circle (Glass/Coaster Style) */}
            <div className={`relative w-20 h-20 rounded-full flex items-center justify-center bg-[var(--bg-elevated)] shadow-2xl overflow-visible group
        ${isActive ? "ring-4 ring-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.6)]" : "ring-4 ring-[var(--border-primary)]"}
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
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute -top-3 -right-3 bg-gradient-to-br from-emerald-400 to-green-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.4)] border border-white/20 z-20 uppercase tracking-tighter"
                    >
                        SAFE
                    </motion.div>
                )}

                {/* Active Turn Spinner */}
                {isActive && (
                    <motion.div
                        className="absolute -inset-2 rounded-full border-2 border-dashed border-yellow-300/60 pointer-events-none"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                    />
                )}

                {/* Voice Indicator Ring */}
                {speaking && (
                    <motion.div
                        className="absolute -inset-2 rounded-full border-4 border-green-500/40 pointer-events-none"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                    />
                )}

                {/* Mic Status Icon */}
                {hasVoice && (
                    <div className={`absolute -bottom-1 -left-1 w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-xl border-2 ${muted ? 'bg-red-500/90 border-red-400/50 text-white' : 'bg-green-500/90 border-green-400/50 text-white'} backdrop-blur-sm transition-colors duration-300`}>
                        {muted ? '✕' : '🎙️'}
                    </div>
                )}
            </div>

            {/* Name & Count (Floating Label) */}
            <div className="text-center relative">
                <div className={`
                    font-bold text-sm px-4 py-1 rounded-full backdrop-blur-md border shadow-lg transition-colors duration-300
                    ${isActive
                        ? "bg-yellow-500 text-yellow-950 border-yellow-400 shadow-yellow-500/20"
                        : "bg-[var(--bg-glass)] text-[var(--text-primary)] border-[var(--border-glass)]"}
                `}>
                    {name}
                </div>

                {!finished && (
                    <div className="text-xs font-semibold text-indigo-500 mt-1 drop-shadow-sm tracking-wide bg-[var(--bg-glass)] px-2 py-0.5 rounded-md inline-block border border-[var(--border-glass)] shadow-sm">
                        {cardCount} Cards
                    </div>
                )}
            </div>
            {/* Mini Discard/Pair Stack (Premium Tiny Cards) */}
            {discards && discards.length > 0 && (
                <div className="flex -space-x-3 mt-1 perspective-500">
                    {discards.slice(-3).map((c, i) => (
                        <div key={i}
                            className="w-6 h-9 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded shadow-sm flex items-center justify-center text-[10px] select-none transform rotate-y-12 hover:rotate-y-0 transition-transform origin-left"
                            style={{ zIndex: i }}
                        >
                            <span className={c.suit === "♥" || c.suit === "♦" ? "text-red-600" : "text-[var(--text-primary)]"}>
                                {c.rank}
                            </span>
                        </div>
                    ))}
                    {discards.length > 3 && (
                        <div className="w-6 h-9 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded shadow-sm flex items-center justify-center text-[8px] text-[var(--text-primary)] select-none z-10">
                            +{discards.length - 3}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
