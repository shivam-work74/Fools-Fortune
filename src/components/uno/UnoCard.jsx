import React from "react";
import { motion } from "framer-motion";

const COLOR_MAP = {
    red: {
        bg: "bg-red-600",
        border: "border-red-400",
        shadow: "shadow-red-500/50",
        text: "text-red-100",
        glow: "hover:shadow-[0_0_20px_rgba(239,68,68,0.6)]",
    },
    blue: {
        bg: "bg-blue-600",
        border: "border-blue-400",
        shadow: "shadow-blue-500/50",
        text: "text-blue-100",
        glow: "hover:shadow-[0_0_20px_rgba(59,130,246,0.6)]",
    },
    green: {
        bg: "bg-green-600",
        border: "border-green-400",
        shadow: "shadow-green-500/50",
        text: "text-green-100",
        glow: "hover:shadow-[0_0_20px_rgba(34,197,94,0.6)]",
    },
    yellow: {
        bg: "bg-yellow-500",
        border: "border-yellow-300",
        shadow: "shadow-yellow-500/50",
        text: "text-yellow-900",
        glow: "hover:shadow-[0_0_20px_rgba(234,179,8,0.6)]",
    },
    wild: {
        bg: "bg-gradient-to-br from-red-500 via-yellow-400 to-blue-500",
        border: "border-white/50",
        shadow: "shadow-white/20",
        text: "text-white",
        glow: "hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]",
    },
};

const CARD_LABELS = {
    skip: "🚫",
    reverse: "↩️",
    draw2: "+2",
    wild: "🌈",
    wild4: "+4\n🌈",
    number: null, // uses value
};

export default function UnoCard({ card, faceDown = false, playable = false, onClick, small = false, style = {} }) {
    const palette = COLOR_MAP[card?.color] || COLOR_MAP.wild;

    if (faceDown) {
        return (
            <motion.div
                style={style}
                whileHover={playable ? { y: -6, scale: 1.04 } : {}}
                onClick={onClick}
                className={`
                    relative rounded-xl border-2 border-white/20 cursor-pointer select-none
                    ${small ? "w-10 h-14" : "w-20 h-28 sm:w-24 sm:h-32"}
                    bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg
                    flex items-center justify-center overflow-hidden
                `}
            >
                <div className="absolute inset-2 border-2 border-white/10 rounded-lg" />
                <span className="text-white/30 font-black text-2xl select-none">UNO</span>
                {/* Shine */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            </motion.div>
        );
    }

    const label = card.type === 'number' ? card.value : CARD_LABELS[card.type];
    const isActionCard = card.type !== 'number';

    return (
        <motion.div
            style={style}
            whileHover={playable ? { y: -10, scale: 1.07, rotate: 0 } : {}}
            whileTap={playable ? { scale: 0.95 } : {}}
            onClick={playable ? onClick : undefined}
            className={`
                relative rounded-xl border-2 select-none overflow-hidden
                ${small ? "w-10 h-14" : "w-20 h-28 sm:w-24 sm:h-32"}
                ${palette.bg} ${palette.border}
                ${playable ? `cursor-pointer shadow-lg ${palette.glow} transition-shadow` : "cursor-default opacity-90"}
                ${!playable && !faceDown ? "brightness-75" : ""}
            `}
        >
            {/* Playable ring highlight */}
            {playable && (
                <motion.div
                    className="absolute inset-0 rounded-xl border-2 border-white/50 pointer-events-none"
                    animate={{ opacity: [0.3, 0.9, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                />
            )}

            {/* Card inner content */}
            <div className="absolute inset-1.5 bg-white/15 rounded-lg border border-white/20 flex items-center justify-center">
                <span className={`font-black text-center leading-tight whitespace-pre ${small ? "text-xs" : isActionCard ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"} drop-shadow-md ${palette.text}`}>
                    {label}
                </span>
            </div>

            {/* Corner pips */}
            {!small && (
                <>
                    <span className={`absolute top-1 left-1.5 text-xs font-black ${palette.text} leading-none`}>{label?.split('\n')[0]}</span>
                    <span className={`absolute bottom-1 right-1.5 text-xs font-black ${palette.text} rotate-180 leading-none`}>{label?.split('\n')[0]}</span>
                </>
            )}

            {/* Shine overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none rounded-xl" />
        </motion.div>
    );
}

// Color dot badge (for current color indicator)
export function ColorIndicator({ color, size = 10 }) {
    const colors = {
        red: "bg-red-500 shadow-red-500/50",
        blue: "bg-blue-500 shadow-blue-500/50",
        green: "bg-green-500 shadow-green-500/50",
        yellow: "bg-yellow-400 shadow-yellow-400/50",
        wild: "bg-gradient-to-br from-red-500 via-yellow-400 to-blue-500 shadow-white/30",
    };
    return (
        <div
            className={`rounded-full shadow-lg ${colors[color] || colors.wild}`}
            style={{ width: size, height: size }}
        />
    );
}
