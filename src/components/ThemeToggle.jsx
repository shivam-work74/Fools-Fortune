import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className={`fixed bottom-8 left-8 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] z-[2000] border transition-all duration-500 backdrop-blur-xl ${theme === 'dark'
                    ? 'bg-black/40 border-white/10 text-yellow-400'
                    : 'bg-white/40 border-black/10 text-amber-600'
                }`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {theme === 'dark' ? '🌙' : '☀️'}
        </motion.button>
    );
}
