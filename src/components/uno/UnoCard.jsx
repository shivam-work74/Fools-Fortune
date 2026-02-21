import React from "react";
import { motion } from "framer-motion";

const COLOR_MAP = {
    red: {
        bg: "bg-gradient-to-br from-red-500 to-red-700",
        border: "border-red-400/50",
        accent: "bg-red-400/20",
        text: "text-white",
        glow: "shadow-[0_0_20px_rgba(239,68,68,0.5)]",
        inner: "bg-red-800/40",
    },
    blue: {
        bg: "bg-gradient-to-br from-blue-500 to-blue-700",
        border: "border-blue-400/50",
        accent: "bg-blue-400/20",
        text: "text-white",
        glow: "shadow-[0_0_20px_rgba(59,130,246,0.5)]",
        inner: "bg-blue-800/40",
    },
    green: {
        bg: "bg-gradient-to-br from-green-500 to-green-700",
        border: "border-green-400/50",
        accent: "bg-green-400/20",
        text: "text-white",
        glow: "shadow-[0_0_20px_rgba(34,197,94,0.5)]",
        inner: "bg-green-800/40",
    },
    yellow: {
        bg: "bg-gradient-to-br from-yellow-400 to-yellow-600",
        border: "border-yellow-200/50",
        accent: "bg-yellow-200/20",
        text: "text-yellow-950",
        glow: "shadow-[0_0_20px_rgba(234,179,8,0.5)]",
        inner: "bg-yellow-200/30",
    },
    wild: {
        bg: "bg-[var(--bg-elevated)] border-[var(--border-primary)]",
        border: "border-[var(--border-primary)]",
        accent: "bg-[var(--text-primary)]/5",
        text: "text-[var(--text-primary)]",
        glow: "shadow-[var(--shadow-premium)]",
        inner: "bg-[var(--text-primary)]/5",
    },
};

const ACTION_ICONS = {
    skip: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full p-1 opacity-90">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
    ),
    reverse: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full p-1 opacity-90">
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
    ),
    draw2: <span className="text-xl sm:text-2xl font-black">+2</span>,
    wild: (
        <div className="w-full h-full relative p-1">
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 rounded-full overflow-hidden border border-white/20 rotate-45">
                <div className="bg-red-500" />
                <div className="bg-blue-500" />
                <div className="bg-yellow-400" />
                <div className="bg-green-500" />
            </div>
        </div>
    ),
    wild4: (
        <div className="relative flex items-center justify-center p-1 w-full h-full">
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 rounded-full overflow-hidden border border-white/20 rotate-45 scale-90 translate-x-1 translate-y-1 opacity-50" />
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] z-10">+4</span>
            </div>
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 rounded-full overflow-hidden border border-white/20 rotate-45" />
        </div>
    ),
};

export default function UnoCard({ card, faceDown = false, playable = false, onClick, small = false, style = {} }) {
    const palette = COLOR_MAP[card?.color] || COLOR_MAP.wild;
    const isAction = card?.type !== 'number';
    const label = card?.type === 'number' ? card.value : (ACTION_ICONS[card?.type] || '?');

    if (faceDown) {
        return (
            <motion.div
                style={style}
                whileHover={playable ? { y: -8, scale: 1.05, rotateY: 5 } : {}}
                onClick={onClick}
                className={`
                    relative rounded-2xl border-2 border-[var(--border-primary)] cursor-pointer select-none overflow-hidden
                    ${small ? "w-10 h-14 border" : "w-20 h-28 sm:w-24 sm:h-32 shadow-[var(--shadow-premium)]"}
                    bg-[var(--bg-secondary)] transition-all duration-300
                `}
            >
                {/* Back Design */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                </div>
                <div className="absolute inset-2 border border-[var(--border-glass)] rounded-xl flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-amber-500/5 to-blue-600/5" />
                    <span className="text-[var(--text-muted)] opacity-20 font-black text-xl tracking-tighter italic">UNO</span>
                </div>
                {/* Physical edge highlight */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20" />
                <div className="absolute top-0 left-0 w-[1px] h-full bg-white/10" />
            </motion.div>
        );
    }

    return (
        <motion.div
            style={style}
            whileHover={playable ? { y: -12, scale: 1.1, rotateY: 0, rotateX: 0, z: 50 } : {}}
            whileTap={playable ? { scale: 0.95 } : {}}
            onClick={playable ? onClick : undefined}
            className={`
                relative rounded-2xl border-2 select-none overflow-hidden transition-all duration-300
                ${small ? "w-10 h-14 border" : "w-20 h-28 sm:w-24 sm:h-32 shadow-[0_15px_35px_rgba(0,0,0,0.5)]"}
                ${palette.bg} ${palette.border}
                ${playable ? `cursor-pointer ${palette.glow} brightness-110` : "cursor-default opacity-85 saturate-[0.8] grayscale-[0.2]"}
            `}
        >
            {/* Playable Pulse Aura */}
            {playable && (
                <motion.div
                    className="absolute inset-[-4px] rounded-[20px] border-2 border-white/40 pointer-events-none"
                    animate={{ opacity: [0, 0.6, 0], scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                />
            )}

            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pixel-weave.png')]" />
            </div>

            {/* Inner Recess */}
            <div className={`absolute inset-2 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden ${palette.inner}`}>
                {/* Center Content */}
                <div className={`flex items-center justify-center ${small ? "" : "w-12 h-12"}`}>
                    {typeof label === 'string' ? (
                        <span className={`font-black tracking-tighter drop-shadow-lg ${palette.text} ${small ? "text-xl" : "text-5xl"}`}>
                            {label}
                        </span>
                    ) : (
                        <div className={`${palette.text} ${small ? "w-6 h-6" : "w-12 h-12"}`}>
                            {label}
                        </div>
                    )}
                </div>
            </div>

            {/* Corner Pips */}
            {!small && (
                <>
                    <div className={`absolute top-1.5 left-2 text-[10px] font-black uppercase flex flex-col items-center ${palette.text}`}>
                        <div className="w-5 h-5 flex items-center justify-center">{label}</div>
                    </div>
                    <div className={`absolute bottom-1.5 right-2 text-[10px] font-black uppercase flex flex-col items-center rotate-180 ${palette.text}`}>
                        <div className="w-5 h-5 flex items-center justify-center">{label}</div>
                    </div>
                </>
            )}

            {/* Glass Shine */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-white/40 rounded-t-2xl" />
        </motion.div>
    );
}

// Color dot badge (for current color indicator)
export function ColorIndicator({ color, size = 10 }) {
    const colors = {
        red: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]",
        blue: "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]",
        green: "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]",
        yellow: "bg-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.8)]",
        wild: "bg-gradient-to-br from-red-500 via-yellow-400 to-blue-500 shadow-white/30",
    };
    return (
        <div
            className={`rounded-full transition-all duration-300 ${colors[color] || colors.wild}`}
            style={{ width: size, height: size }}
        />
    );
}
