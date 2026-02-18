
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { motion } from "framer-motion";
import axios from "axios";

const API_BASE = import.meta.env.VITE_SERVER_URL || (import.meta.env.DEV ? "http://localhost:3001" : "");

export default function Dashboard() {
    const { user, logout } = useAuth();
    const socket = useSocket();
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);
    const [joinId, setJoinId] = useState("");

    useEffect(() => {
        axios.get(`${API_BASE}/api/leaderboard`).then(res => setLeaderboard(res.data));

        if (socket) {
            socket.on('lobbyCreated', ({ lobbyId }) => {
                navigate(`/lobby`, { state: { lobbyId, isHost: true } });
            });

            socket.on('playerJoined', ({ players }) => {
                // Handled in Lobby
            });

            socket.on('error', (err) => alert(err));
        }
        return () => socket?.off('lobbyCreated');
    }, [socket, navigate]);

    const handleCreateLobby = (mode) => {
        socket.emit('createLobby', { username: user.username, avatar: "🎩", mode });
    };

    const handleJoinLobby = () => {
        if (!joinId) return;
        navigate(`/lobby`, { state: { lobbyId: joinId, isHost: false } });
    };

    return (
        <div className="min-h-screen bg-plush text-amber-50 p-6 font-serif overflow-hidden relative">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-900/10 to-black/80 pointer-events-none" />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-20 -left-20 w-72 h-72 bg-yellow-600/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

                {/* Left Column: Membership Card & Leaderboard */}
                <div className="lg:col-span-4 space-y-8 lg:pt-16">
                    {/* Membership Card */}
                    <motion.div
                        initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6, ease: "easeOut" }}
                        className="bg-black/60 border-gold backdrop-blur-md rounded-xl p-6 shadow-plush relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl text-yellow-500 rotate-12">♛</div>

                        <div className="flex items-center gap-4 mb-6 relative">
                            <div className="w-20 h-20 rounded-full border-2 border-yellow-500/50 p-1 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                                <div className="w-full h-full rounded-full bg-gradient-to-b from-gray-700 to-black flex items-center justify-center text-3xl">
                                    {user.avatar || "🎩"}
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gold tracking-wide">{user.username}</h2>
                                <p className="text-yellow-500/60 text-xs uppercase tracking-[0.2em] font-sans mt-1">Diamond Member</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                <span className="block text-2xl font-bold text-white">{user.stats.wins}</span>
                                <span className="text-[10px] uppercase text-gray-400 tracking-widest font-sans">Victories</span>
                            </div>
                            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                <span className="block text-2xl font-bold text-red-300">{user.stats.losses}</span>
                                <span className="text-[10px] uppercase text-gray-400 tracking-widest font-sans">Defeats</span>
                            </div>
                            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                <span className="block text-xl font-bold text-purple-300">{user.stats.timesQueenHeld || 0}</span>
                                <span className="text-[10px] uppercase text-gray-400 tracking-widest font-sans">Queens Held</span>
                            </div>
                            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                <span className="block text-sm font-bold text-yellow-500 truncate">
                                    {Object.entries(user.stats.rivals || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || "-"}
                                </span>
                                <span className="text-[10px] uppercase text-gray-400 tracking-widest font-sans">Nemesis</span>
                            </div>
                        </div>

                        <button onClick={logout} className="w-full mt-6 py-2 text-xs text-red-400/60 hover:text-red-400 font-sans uppercase tracking-widest hover:bg-red-500/10 rounded transition-colors">
                            Revoke Membership
                        </button>
                    </motion.div>

                    {/* Elite Circle (Leaderboard) */}
                    <div className="bg-black/40 border-gold rounded-xl p-6 backdrop-blur-sm">
                        <h3 className="text-lg font-bold text-gold mb-6 border-b border-yellow-500/20 pb-2">The Inner Circle</h3>
                        <div className="space-y-4">
                            {leaderboard.map((u, i) => (
                                <div key={i} className="flex justify-between items-center text-sm group cursor-default">
                                    <div className="flex items-center gap-3">
                                        <span className={`font-mono text-xs w-6 h-6 flex items-center justify-center rounded-full ${i === 0 ? 'bg-yellow-500 text-black font-bold' : 'text-gray-500 bg-white/5'}`}>
                                            {i + 1}
                                        </span>
                                        <span className="text-gray-300 group-hover:text-yellow-200 transition-colors font-medium">{u.username}</span>
                                    </div>
                                    <span className="font-mono text-yellow-500/80">{u.wins} W</span>
                                </div>
                            ))}
                            {leaderboard.length === 0 && <p className="text-gray-500 text-sm italic">No elite members yet.</p>}
                        </div>
                    </div>
                </div>

                {/* Right Column: Main Lounge Area */}
                <div className="lg:col-span-8 space-y-8">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-center py-8"
                    >
                        <h1 className="text-6xl md:text-7xl font-bold text-gold mb-2 tracking-tighter drop-shadow-2xl">FOOL'S GATHERING</h1>
                        <p className="text-xl text-yellow-100/50 font-light tracking-widest font-sans uppercase">High Stakes. Zero Mercy.</p>
                    </motion.div>

                    {/* Host a Table */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.button
                            whileHover={{ scale: 1.02, translateY: -5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleCreateLobby(2)}
                            className="relative h-64 bg-gradient-to-br from-gray-900 to-black border-gold rounded-2xl p-8 text-left group overflow-hidden shadow-plush"
                        >
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                            <div className="absolute top-4 right-4 text-4xl opacity-20 group-hover:opacity-100 group-hover:text-gold transition-all duration-500">⚔️</div>

                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div>
                                    <h3 className="text-3xl font-bold text-white group-hover:text-gold transition-colors mb-2">The Duel</h3>
                                    <div className="h-0.5 w-12 bg-yellow-600/50 group-hover:w-24 transition-all duration-500" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm font-sans mb-1">1 vs 1 • Classic Rules</p>
                                    <p className="text-yellow-500/60 text-xs uppercase tracking-widest font-sans">Open Private Suite</p>
                                </div>
                            </div>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02, translateY: -5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleCreateLobby(4)}
                            className="relative h-64 bg-gradient-to-br from-purple-900/20 to-black border-gold rounded-2xl p-8 text-left group overflow-hidden shadow-plush"
                        >
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                            <div className="absolute top-4 right-4 text-4xl opacity-20 group-hover:opacity-100 group-hover:text-purple-400 transition-all duration-500">🎲</div>

                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div>
                                    <h3 className="text-3xl font-bold text-white group-hover:text-purple-300 transition-colors mb-2">Fortune's Chaos</h3>
                                    <div className="h-0.5 w-12 bg-purple-600/50 group-hover:w-24 transition-all duration-500" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm font-sans mb-1">4 Players • Total Mayhem</p>
                                    <p className="text-purple-500/60 text-xs uppercase tracking-widest font-sans">Host Chaos Table</p>
                                </div>
                            </div>
                        </motion.button>
                    </div>

                    {/* Join Section */}
                    <div className="bg-black/40 border-gold rounded-xl p-8 flex flex-col md:flex-row gap-8 items-center justify-between backdrop-blur-md">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-1">Have an Invitation?</h3>
                            <p className="text-gray-400 text-sm font-sans">Enter the VIP access code to join a private suite.</p>
                        </div>
                        <div className="flex w-full md:w-auto gap-0 shadow-lg">
                            <input
                                type="text"
                                value={joinId}
                                onChange={(e) => setJoinId(e.target.value)}
                                placeholder="VIP-CODE"
                                className="bg-white/5 border border-white/10 rounded-l-lg px-6 py-4 focus:outline-none focus:bg-white/10 w-full md:w-64 font-mono tracking-widest text-center uppercase placeholder-gray-600"
                            />
                            <button
                                onClick={handleJoinLobby}
                                className="bg-gradient-to-b from-yellow-500 to-yellow-700 hover:from-yellow-400 hover:to-yellow-600 text-black px-8 py-4 rounded-r-lg font-bold uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                            >
                                Enter
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
