import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import { useVoice } from "../../context/VoiceContext";
import { motion, AnimatePresence } from "framer-motion";
import { EmoteSelector, EmoteOverlay } from "./EmoteSystem";

export default function UnoLobby() {
    const { state } = useLocation();
    const { user } = useAuth();
    const { myPeerId, callUser, isMuted, toggleMute, isSpeakerEnabled, toggleSpeaker, repairAudio, testMic } = useVoice();
    const socket = useSocket();
    const navigate = useNavigate();

    const [players, setPlayers] = useState([]);
    const [lobbyId, setLobbyId] = useState(state?.lobbyId || "");
    const [error, setError] = useState("");
    const [joining, setJoining] = useState(false);
    const joinedRef = useRef(false);

    const [maxPlayers, setMaxPlayers] = useState(state?.maxPlayers || 4);
    const isHost = state?.isHost || false;

    // ── Register all socket listeners once ──
    useEffect(() => {
        if (!socket) return;

        socket.on('uno:lobbyCreated', ({ lobbyId: newId, players: ps, maxPlayers: mp }) => {
            setLobbyId(newId);
            setPlayers(ps);
            if (mp) setMaxPlayers(mp);
        });

        socket.on('uno:playerJoined', ({ players: ps, maxPlayers: mp }) => {
            setPlayers(ps);
            if (mp) setMaxPlayers(mp);
            setJoining(false);
            // Auto-call new players
            ps.forEach(p => {
                if (p.username !== user.username && p.peerId) {
                    // Only call if my username is less than theirs (lexicographical)
                    // This ensures only one person starts the call between any pair
                    if (user.username < p.username) {
                        callUser(p.username, p.peerId);
                    }
                }
            });
        });

        socket.on('uno:gameStarted', ({ lobbyId: gameLobbyId }) => {
            navigate(`/uno/${gameLobbyId}`);
        });

        socket.on('uno:kicked', () => navigate('/dashboard'));

        socket.on('uno:error', (err) => {
            setError(err);
            setJoining(false);
            joinedRef.current = false;
        });

        return () => {
            socket.off('uno:lobbyCreated');
            socket.off('uno:playerJoined');
            socket.off('uno:gameStarted');
            socket.off('uno:kicked');
            socket.off('uno:error');
        };
    }, [socket, navigate]);

    // ── Host: sync PeerID once available ──
    useEffect(() => {
        if (!isHost || !socket || !lobbyId || !myPeerId) return;
        socket.emit('uno:joinLobby', {
            lobbyId,
            username: user.username,
            avatar: '🃏',
            peerId: myPeerId
        });
    }, [isHost, socket, lobbyId, myPeerId, user.username]);

    // ── Guest: emit joinLobby when socket and lobbyId are ready ──
    useEffect(() => {
        if (!socket || !lobbyId || isHost || joinedRef.current || !myPeerId) return;
        joinedRef.current = true;
        setJoining(true);
        setError("");
        socket.emit('uno:joinLobby', {
            lobbyId,
            username: user.username,
            avatar: '🃏',
            peerId: myPeerId
        });
    }, [socket, lobbyId, isHost, user.username, myPeerId]);

    const handleStart = () => {
        if (!socket || !lobbyId) return;
        socket.emit('uno:startGame', { lobbyId });
    };

    const handleKick = (targetId) => {
        socket.emit('uno:kickPlayer', { lobbyId, targetId });
    };

    const handleSendEmote = (emote) => {
        if (!socket || !lobbyId) return;
        socket.emit('uno:sendEmote', { lobbyId, emote });
    };

    const copyCode = () => {
        if (lobbyId) {
            navigator.clipboard.writeText(lobbyId);
        }
    };

    const handleRetryJoin = () => {
        if (!socket || !lobbyId || !myPeerId) return;
        joinedRef.current = false;
        setError("");
        setJoining(true);
        joinedRef.current = true;
        socket.emit('uno:joinLobby', {
            lobbyId,
            username: user.username,
            avatar: '🃏',
            peerId: myPeerId
        });
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-4 font-sans relative overflow-hidden transition-colors duration-500">
            {/* Immersive Background Elements */}
            <EmoteOverlay socket={socket} players={players} />
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-600 rounded-full blur-[180px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[180px]" />
                <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-yellow-500 rounded-full blur-[150px]" />
                <div className="absolute bottom-[20%] left-[5%] w-[40%] h-[40%] bg-green-600 rounded-full blur-[160px]" />
                {/* Felt Texture Pattern */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-30" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-6xl w-full bg-[var(--bg-glass)] backdrop-blur-2xl border border-[var(--border-glass)] rounded-[40px] p-8 lg:p-14 shadow-[var(--shadow-premium)] relative z-10"
            >
                {/* Luxury Top Bar */}
                <div className="absolute top-0 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-red-500/80 to-transparent" />
                <div className="absolute top-0 left-0 w-full h-full rounded-[40px] pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[var(--text-primary)]/5 to-transparent" />
                </div>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <motion.div
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_15px_#ef4444]"
                            />
                            <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--text-muted)] font-bold">The Royal Tournament</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none flex items-center">
                                <span className="text-red-600 drop-shadow-[0_4px_10px_rgba(220,38,38,0.5)]">U</span>
                                <span className="text-blue-600 mx-[-0.05em] drop-shadow-[0_4px_10px_rgba(37,99,235,0.5)]">N</span>
                                <span className="text-green-600 drop-shadow-[0_4px_10px_rgba(22,163,74,0.5)]">O</span>
                                <span className="text-[var(--text-primary)] text-4xl md:text-5xl ml-4 font-light tracking-[0.1em]">PREMIUM</span>
                            </h1>
                            <EmoteSelector onSelect={handleSendEmote} />
                            <div className="flex gap-3 bg-[var(--bg-elevated)] p-2 rounded-2xl border border-[var(--border-primary)] ml-4">
                                <button
                                    onClick={testMic}
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all shadow-lg hover:scale-110 active:scale-95 border bg-blue-600/20 border-blue-500/50 text-white"
                                    title="Test Microphone"
                                >
                                    🧪
                                </button>
                                <button
                                    onClick={toggleMute}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all shadow-lg hover:scale-110 active:scale-95 border ${isMuted ? 'bg-red-600/40 border-red-500/50 text-white' : 'bg-green-600/40 border-green-500/50 text-white'}`}
                                    title={isMuted ? "Unmute Mic" : "Mute Mic"}
                                >
                                    {isMuted ? '🔇' : '🎙️'}
                                </button>
                                <button
                                    onClick={toggleSpeaker}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all shadow-lg hover:scale-110 active:scale-95 border ${!isSpeakerEnabled ? 'bg-red-600/40 border-red-500/50 text-white' : 'bg-blue-600/40 border-blue-500/50 text-white'}`}
                                    title={isSpeakerEnabled ? "Disable Speaker" : "Enable Speaker"}
                                >
                                    {isSpeakerEnabled ? '🔊' : '🔇'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {lobbyId && (
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="flex flex-col items-end"
                        >
                            <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)] mb-2 font-bold px-4">Invitation Link</span>
                            <div
                                onClick={copyCode}
                                className="flex items-center gap-4 bg-[var(--bg-glass)] hover:bg-[var(--bg-elevated)] border border-[var(--border-glass)] rounded-3xl pl-6 pr-2 py-2 cursor-pointer transition-all group shadow-sm"
                            >
                                <span className="font-mono text-xl tracking-[0.3em] text-[var(--text-primary)] group-hover:text-amber-400 transition-colors">{lobbyId}</span>
                                <div className="bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-2xl group-active:scale-95 transition-transform">
                                    Copy
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Players Section */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-primary)]">                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Active Contenders</h3>                            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{players.length} / {maxPlayers} Seats Occupied</span>                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <AnimatePresence>
                                {players.map((p, i) => (
                                    <motion.div
                                        key={p.id || i}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="group relative flex items-center gap-5 bg-[var(--bg-elevated)]/50 hover:bg-[var(--bg-elevated)] border border-[var(--border-primary)] hover:border-yellow-500/30 rounded-[24px] p-5 transition-all duration-300"
                                    >
                                        <div className="relative">
                                            <div className={`absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500 ${p.isHost ? 'bg-amber-400' : 'bg-blue-400'}`} />
                                            <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] border-2 border-[var(--border-primary)] flex items-center justify-center text-3xl z-10 relative">
                                                {p.avatar}
                                            </div>
                                            {p.isHost && (
                                                <div className="absolute -top-1 -right-1 bg-amber-500 text-black w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-black z-20">
                                                    ★
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="text-xl font-bold text-[var(--text-primary)] truncate group-hover:text-amber-100 transition-colors">
                                                {p.username}
                                                {p.id === socket?.id && <span className="text-[10px] ml-2 text-[var(--text-muted)] uppercase font-black tracking-tighter">(You)</span>}
                                            </div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mt-1">
                                                {p.isHost ? "Grand Master" : "Challenger"}
                                            </p>
                                        </div>

                                        {isHost && !p.isHost && (
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleKick(p.id)}
                                                className="opacity-0 group-hover:opacity-100 w-10 h-10 flex items-center justify-center rounded-xl bg-red-600/20 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white transition-all"
                                            >
                                                <span className="text-[18px]">×</span>
                                            </motion.button>
                                        )}
                                    </motion.div>
                                ))}

                                {Array.from({ length: Math.max(0, maxPlayers - players.length) }).map((_, i) => (
                                    <div key={`empty-${i}`} className="flex items-center gap-5 p-5 rounded-[24px] border-2 border-dashed border-[var(--border-primary)] bg-[var(--bg-elevated)]/20 opacity-50">
                                        <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] border-2 border-[var(--border-primary)] flex items-center justify-center">
                                            <span className="text-[var(--text-muted)] font-bold">?</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-4 w-28 bg-[var(--bg-elevated)] rounded-full" />
                                            <div className="h-2 w-16 bg-[var(--bg-elevated)] rounded-full" />
                                        </div>
                                    </div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Sidebar Controls */}
                    <div className="lg:col-span-4 flex flex-col gap-10">
                        {/* Status Overlay */}
                        <div className="bg-[var(--bg-glass)] border border-[var(--border-glass)] rounded-[32px] p-8 space-y-6 shadow-sm">
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Table Settings</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-[var(--text-muted)] font-medium">Card Stack</span>
                                        <span className="text-white/80 font-bold uppercase tracking-widest text-[10px] bg-red-500/20 border border-red-500/30 px-2 py-1 rounded">Enabled</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-[var(--text-muted)] font-medium">Challenge</span>
                                        <span className="text-[var(--text-primary)] font-bold uppercase tracking-widest text-[10px] bg-blue-500/20 border border-blue-500/30 px-2 py-1 rounded">Active</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-[var(--text-muted)] font-medium">Rules</span>
                                        <span className="text-[var(--text-primary)] font-bold uppercase tracking-widest text-[10px] border border-[var(--border-primary)] px-2 py-1 rounded">Standard</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 text-center">
                                {joining && !error ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 animate-pulse">Establishing Connection</span>
                                    </div>
                                ) : error ? (
                                    <div className="space-y-4">
                                        <div className="text-[10px] text-red-400 uppercase font-black tracking-widest leading-relaxed">
                                            {error}
                                        </div>
                                        {!isHost && (
                                            <button
                                                onClick={handleRetryJoin}
                                                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg transition-all"
                                            >
                                                Retry Connection
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.3em]">
                                            {players.length < 2 ? "Waiting for players" : "All seats ready"}
                                        </p>

                                        {isHost ? (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleStart}
                                                disabled={players.length < 2}
                                                className={`w-full py-6 rounded-[24px] font-black text-xs uppercase tracking-[0.5em] transition-all duration-500 overflow-hidden relative group ${players.length < 2
                                                    ? "bg-white/5 text-white/10 cursor-not-allowed border border-white/5 saturate-0"
                                                    : "bg-red-600 text-white shadow-[0_20px_40px_rgba(220,38,38,0.3)] hover:shadow-[0_25px_50px_rgba(220,38,38,0.5)] border-t border-white/30"
                                                    }`}
                                            >
                                                <span className="relative z-10">Deal The Cards</span>
                                                <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </motion.button>
                                        ) : (
                                            <div className="py-4 flex flex-col items-center gap-4">
                                                <div className="flex gap-1.5">
                                                    {[0, 1, 2].map(i => (
                                                        <motion.div
                                                            key={i}
                                                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                                                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                                            className="w-1.5 h-1.5 rounded-full bg-amber-400/50"
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.5em]">House is Dealing</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/dashboard')}
                            className="text-[10px] font-black text-[var(--text-muted)] hover:text-red-500 uppercase tracking-[0.5em] transition-all self-center"
                        >
                            Return To Dashboard
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
