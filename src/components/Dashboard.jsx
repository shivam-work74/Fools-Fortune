import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useVoice } from "../context/VoiceContext";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const API_BASE = import.meta.env.VITE_SERVER_URL || (import.meta.env.DEV ? "http://localhost:3001" : "");

// ─── Sub-Components for Analytics ─────────────────────────────────────────────

function SkillMeter({ rating }) {
    const percentage = Math.min((rating / 2500) * 100, 100);
    const getRank = (r) => {
        if (r < 1100) return { label: "Novice", color: "text-gray-400", bg: "bg-gray-400" };
        if (r < 1300) return { label: "Strategist", color: "text-blue-400", bg: "bg-blue-400" };
        if (r < 1600) return { label: "Elite", color: "text-purple-400", bg: "bg-purple-400" };
        return { label: "Grandmaster", color: "text-amber-400", bg: "bg-amber-400" };
    };
    const rank = getRank(rating);

    return (
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 block mb-1">Potential Score</span>
                    <span className="text-4xl font-black text-white tracking-tighter">{rating} <span className="text-sm text-white/20 font-medium">MMR</span></span>
                </div>
                <div className="text-right">
                    <span className={`text-sm font-black uppercase tracking-widest ${rank.color}`}>{rank.label}</span>
                </div>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className={`h-full ${rank.bg} shadow-[0_0_15px_rgba(255,255,255,0.2)]`}
                />
            </div>
            <p className="text-[9px] text-white/20 mt-3 uppercase tracking-wider font-medium">Rank resets in 14 days • Keep playing to analyze growth</p>
        </div>
    );
}

function StrategyHeatmap({ unoStats }) {
    if (!unoStats) return null;
    const items = [
        { label: "Tactical Skips", value: unoStats.skipsUsed, color: "bg-blue-500" },
        { label: "Reversals", value: unoStats.reversesUsed, color: "bg-purple-500" },
        { label: "Draw Power", value: unoStats.drawsUsed, color: "bg-red-500" },
        { label: "Wild Influence", value: unoStats.wildsUsed, color: "bg-amber-500" },
    ];
    const max = Math.max(...items.map(i => i.value), 1);

    return (
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 backdrop-blur-md">
            <h4 className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-6">Strategic Influence</h4>
            <div className="space-y-4">
                {items.map(item => (
                    <div key={item.label} className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/60">
                            <span>{item.label}</span>
                            <span>{item.value}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(item.value / max) * 100}%` }}
                                className={`h-full ${item.color}`}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function MatchLedger({ history }) {
    return (
        <div className="bg-black/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
            <h3 className="text-xl font-black text-white mb-8 tracking-tighter flex items-center gap-3">
                <span className="w-2 h-6 bg-red-600 rounded-full" />
                COMMISSIONER'S LEDGER
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {history?.map((match, i) => (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={i}
                        className="group flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-2xl transition-all cursor-default"
                    >
                        <div className="flex items-center gap-5">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black ${match.result === 'win' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                {match.result === 'win' ? 'W' : 'L'}
                            </div>
                            <div>
                                <div className="text-sm font-black text-white/90 uppercase tracking-tight">{match.game === 'uno' ? 'UNO Grand Prix' : 'Fools Fortune Duel'}</div>
                                <div className="text-[10px] text-white/30 font-medium uppercase tracking-widest">{new Date(match.date).toLocaleDateString()} • {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/60 transition-colors">Potential Analyzed</div>
                            <div className="text-white/20 group-hover:text-amber-500/40 transition-colors">→</div>
                        </div>
                    </motion.div>
                ))}
                {(!history || history.length === 0) && (
                    <div className="py-20 text-center">
                        <p className="text-white/20 font-black text-xs uppercase tracking-[0.3em]">No Recorded Data Points</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function Dashboard() {
    const { user: authUser, logout } = useAuth();
    const socket = useSocket();
    const { myPeerId } = useVoice();
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);
    const [joinId, setJoinId] = useState("");
    const [user, setUser] = useState(authUser);
    const [activeTab, setActiveTab] = useState('rooms'); // 'rooms' or 'vault'

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/user/${authUser.username}`);
            setUser(res.data);
            // Sync with local storage if needed
        } catch (err) {
            console.error("Failed to fetch profile", err);
        }
    };

    useEffect(() => {
        fetchProfile();
        axios.get(`${API_BASE}/api/leaderboard`).then(res => setLeaderboard(res.data)).catch(() => { });

        if (socket) {
            socket.on('lobbyCreated', ({ lobbyId }) => {
                navigate(`/lobby`, { state: { lobbyId, isHost: true } });
            });
            socket.on('uno:lobbyCreated', ({ lobbyId }) => {
                navigate(`/uno-lobby`, { state: { lobbyId, isHost: true } });
            });
            socket.on('error', (err) => alert(err));
        }
        return () => {
            socket?.off('lobbyCreated');
            socket?.off('uno:lobbyCreated');
        };
    }, [socket, navigate, authUser.username]);

    const handleCreateLobby = (mode) => {
        socket.emit('createLobby', { username: user.username, avatar: "🎩", mode, peerId: myPeerId });
    };

    const handleCreateUnoLobby = (maxPlayers) => {
        socket.emit('uno:createLobby', { username: user.username, avatar: "🃏", maxPlayers, peerId: myPeerId });
    };

    const handleJoinLobby = () => {
        const id = joinId.trim();
        if (!id) return;
        if (id.startsWith('UNO-')) {
            navigate(`/uno-lobby`, { state: { lobbyId: id, isHost: false } });
        } else {
            navigate(`/lobby`, { state: { lobbyId: id, isHost: false } });
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-amber-50 font-sans overflow-y-auto relative perspective-1000">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-900/10 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
                    <div className="flex items-center gap-8">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-white/10 to-transparent border border-white/20 p-1 group-hover:scale-105 transition-transform">
                                <div className="w-full h-full rounded-[20px] bg-black flex items-center justify-center text-4xl shadow-inner">
                                    {user.avatar || "🎩"}
                                </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-amber-500 text-black text-[9px] font-black px-2 py-1 rounded-lg shadow-xl uppercase tracking-tighter">Diamond</div>
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">{user.username}</h2>
                            <div className="flex items-center gap-4 mt-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Member Since 2024</span>
                                <div className="h-1 w-1 bg-white/20 rounded-full" />
                                <button onClick={logout} className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500/60 hover:text-red-500 transition-colors">Terminate Access</button>
                            </div>
                        </div>
                    </div>

                    <div className="flex bg-white/[0.03] border border-white/10 rounded-2xl p-1.5 backdrop-blur-xl">
                        <button
                            onClick={() => setActiveTab('rooms')}
                            className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'rooms' ? 'bg-white text-black shadow-xl' : 'text-white/40 hover:text-white/60'}`}
                        >
                            Game Rooms
                        </button>
                        <button
                            onClick={() => setActiveTab('vault')}
                            className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'vault' ? 'bg-white text-black shadow-xl' : 'text-white/40 hover:text-white/60'}`}
                        >
                            Performance Vault
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'rooms' ? (
                        <motion.div
                            key="rooms"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-10"
                        >
                            {/* Left: General Stats & Leaderboard */}
                            <div className="lg:col-span-4 space-y-8">
                                <div className="bg-black/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                            <span className="block text-3xl font-black text-white">{user.stats.wins}</span>
                                            <span className="text-[9px] uppercase text-white/20 tracking-[0.2em] font-black">Victories</span>
                                        </div>
                                        <div className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                            <span className="block text-3xl font-black text-red-500/80">{user.stats.losses}</span>
                                            <span className="text-[9px] uppercase text-white/20 tracking-[0.2em] font-black">Defeats</span>
                                        </div>
                                    </div>

                                    <div className="mt-8 space-y-4">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
                                            <span>Win Consistency</span>
                                            <span className="text-white/70">{Math.round((user.stats.wins / (user.stats.matches || 1)) * 100)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-500 shadow-[0_0_10px_#f59e0b66]" style={{ width: `${(user.stats.wins / (user.stats.matches || 1)) * 100}%` }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-black/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                                    <h3 className="text-sm font-black text-white mb-6 uppercase tracking-[0.4em]">The Inner Circle</h3>
                                    <div className="space-y-4">
                                        {leaderboard.map((u, i) => (
                                            <div key={i} className="flex justify-between items-center group">
                                                <div className="flex items-center gap-4">
                                                    <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-black ${i === 0 ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/40'}`}>
                                                        {i + 1}
                                                    </span>
                                                    <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{u.username}</span>
                                                </div>
                                                <span className="text-[10px] font-black text-amber-500/40 uppercase tabular-nums">{u.wins} Wins</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Game selection */}
                            <div className="lg:col-span-8 space-y-12">
                                {/* Fool's Fortune Section */}
                                <section>
                                    <div className="flex items-center gap-4 mb-6">
                                        <h3 className="text-xl font-black text-white tracking-tighter uppercase">Fool's Fortune</h3>
                                        <div className="h-px flex-1 bg-white/10" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <motion.button
                                            whileHover={{ y: -8, scale: 1.02 }}
                                            onClick={() => handleCreateLobby(2)}
                                            className="relative h-64 bg-gradient-to-br from-[#1a1a0d] to-black border border-yellow-900/40 rounded-[32px] p-8 text-left group overflow-hidden shadow-2xl transition-all hover:border-yellow-500/60"
                                        >
                                            <div className="absolute top-6 right-6 text-5xl opacity-10 group-hover:opacity-100 group-hover:rotate-12 transition-all duration-500">♠️</div>
                                            <div className="relative z-10 flex flex-col h-full justify-between">
                                                <div className="space-y-4">
                                                    <div className="flex gap-1">
                                                        <div className="w-1.5 h-6 rounded-full bg-yellow-600 opacity-40" />
                                                        <div className="w-1.5 h-6 rounded-full bg-purple-600 opacity-40" />
                                                    </div>
                                                    <h4 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">The Duel<br /><span className="text-sm font-medium text-white/20 tracking-normal">Private Lounge • 2P</span></h4>
                                                </div>
                                                <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em] group-hover:translate-x-2 transition-transform">Create Lobby →</span>
                                            </div>
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ y: -8, scale: 1.02 }}
                                            onClick={() => handleCreateLobby(4)}
                                            className="relative h-64 bg-gradient-to-br from-[#120512] to-black border border-purple-900/40 rounded-[32px] p-8 text-left group overflow-hidden shadow-2xl transition-all hover:border-purple-500/60"
                                        >
                                            <div className="absolute top-6 right-6 text-5xl opacity-10 group-hover:opacity-100 group-hover:-rotate-12 transition-all duration-500">👑</div>
                                            <div className="relative z-10 flex flex-col h-full justify-between">
                                                <div className="space-y-4">
                                                    <div className="flex gap-1">
                                                        <div className="w-1.5 h-6 rounded-full bg-yellow-600 opacity-40" />
                                                        <div className="w-1.5 h-6 rounded-full bg-purple-600 opacity-40" />
                                                    </div>
                                                    <h4 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Grand Table<br /><span className="text-sm font-medium text-white/20 tracking-normal">Royal Court • 4P</span></h4>
                                                </div>
                                                <span className="text-[10px] font-black text-purple-500 uppercase tracking-[0.3em] group-hover:translate-x-2 transition-transform">Host Table →</span>
                                            </div>
                                        </motion.button>
                                    </div>
                                </section>

                                {/* UNO Section */}
                                <section>
                                    <div className="flex items-center gap-4 mb-6">
                                        <h3 className="text-xl font-black text-white tracking-tighter">UNO PROMENADE</h3>
                                        <div className="h-px flex-1 bg-white/10" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <motion.button
                                            whileHover={{ y: -8, scale: 1.02 }}
                                            onClick={() => handleCreateUnoLobby(2)}
                                            className="relative h-64 bg-gradient-to-br from-[#120505] to-black border border-red-900/40 rounded-[32px] p-8 text-left group overflow-hidden shadow-2xl transition-all hover:border-red-500/60"
                                        >
                                            <div className="absolute top-6 right-6 text-5xl opacity-10 group-hover:opacity-100 group-hover:rotate-12 transition-all duration-500">🃏</div>
                                            <div className="relative z-10 flex flex-col h-full justify-between">
                                                <div className="space-y-4">
                                                    <div className="flex gap-1">
                                                        {['red', 'blue', 'green', 'yellow'].map(c => <div key={c} className="w-1.5 h-6 rounded-full opacity-40" style={{ backgroundColor: c }} />)}
                                                    </div>
                                                    <h4 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">UNO Duel<br /><span className="text-sm font-medium text-white/20 tracking-normal">Imperial Suite • 2P</span></h4>
                                                </div>
                                                <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] group-hover:translate-x-2 transition-transform">Create Lobby →</span>
                                            </div>
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ y: -8, scale: 1.02 }}
                                            onClick={() => handleCreateUnoLobby(4)}
                                            className="relative h-64 bg-gradient-to-br from-[#050512] to-black border border-blue-900/40 rounded-[32px] p-8 text-left group overflow-hidden shadow-2xl transition-all hover:border-blue-500/60"
                                        >
                                            <div className="absolute top-6 right-6 text-5xl opacity-10 group-hover:opacity-100 group-hover:-rotate-12 transition-all duration-500">🌈</div>
                                            <div className="relative z-10 flex flex-col h-full justify-between">
                                                <div className="space-y-4">
                                                    <div className="flex gap-1">
                                                        {['red', 'blue', 'green', 'yellow'].map(c => <div key={c} className="w-1.5 h-6 rounded-full opacity-40" style={{ backgroundColor: c }} />)}
                                                    </div>
                                                    <h4 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">UNO Mayhem<br /><span className="text-sm font-medium text-white/20 tracking-normal">Grand Coliseum • 4P</span></h4>
                                                </div>
                                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] group-hover:translate-x-2 transition-transform">Host Table →</span>
                                            </div>
                                        </motion.button>
                                    </div>
                                </section>

                                {/* Invitation Section */}
                                <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-10 flex flex-col md:flex-row gap-8 items-center justify-between backdrop-blur-xl group">
                                    <div>
                                        <h3 className="text-2xl font-black text-white mb-1 tracking-tighter">VIP INVITATION?</h3>
                                        <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Enter the exclusive access code below</p>
                                    </div>
                                    <div className="flex w-full md:w-auto shadow-2xl">
                                        <input
                                            type="text"
                                            value={joinId}
                                            onChange={(e) => setJoinId(e.target.value.toUpperCase())}
                                            placeholder="UNO-XXXXX"
                                            className="bg-black/60 border border-white/10 rounded-l-2xl px-6 py-4 focus:outline-none focus:border-white/30 w-full md:w-56 font-black tracking-[0.2em] text-center uppercase placeholder-white/10 text-xs"
                                        />
                                        <button
                                            onClick={handleJoinLobby}
                                            className="bg-white text-black px-8 py-4 rounded-r-2xl font-black uppercase tracking-widest text-xs transition-all hover:bg-amber-500 shadow-xl"
                                        >
                                            Enter
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="vault"
                            initial={{ opacity: 0, scale: 1.02 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-10"
                        >
                            {/* Performance Metrics Column */}
                            <div className="lg:col-span-5 space-y-8">
                                <SkillMeter rating={user.stats.skillRating || 1000} />
                                <StrategyHeatmap unoStats={user.stats.uno} />

                                <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-3xl p-8 backdrop-blur-xl">
                                    <h4 className="text-[10px] uppercase tracking-[0.4em] text-amber-500 mb-6 font-black">Growth Milestones</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { label: "Matches", val: user.stats.matches, target: 50 },
                                            { label: "UNO calls", val: user.stats.uno?.successfulUnos || 0, target: 20 },
                                            { label: "Victories", val: user.stats.wins, target: 10 },
                                        ].map(m => (
                                            <div key={m.label} className="text-center">
                                                <div className="w-12 h-12 mx-auto rounded-full border border-white/10 flex items-center justify-center text-sm font-black text-white/40 mb-2">
                                                    {Math.min(Math.round((m.val / m.target) * 100), 100)}%
                                                </div>
                                                <span className="block text-[8px] font-black uppercase tracking-widest text-white/20">{m.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Match History Ledger */}
                            <div className="lg:col-span-7">
                                <MatchLedger history={user.matchHistory} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
