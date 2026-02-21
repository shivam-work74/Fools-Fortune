import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";

export default function UnoLobby() {
    const { state } = useLocation();
    const { user } = useAuth();
    const socket = useSocket();
    const navigate = useNavigate();

    const [players, setPlayers] = useState([]);
    const [lobbyId, setLobbyId] = useState(state?.lobbyId || "");
    const [error, setError] = useState("");
    const [joining, setJoining] = useState(false);
    const joinedRef = useRef(false); // prevent double-join

    const maxPlayers = state?.maxPlayers || 4;
    const isHost = state?.isHost || false;

    // ── Register all socket listeners once ──
    useEffect(() => {
        if (!socket) return;

        socket.on('uno:lobbyCreated', ({ lobbyId: newId, players: ps }) => {
            setLobbyId(newId);
            setPlayers(ps);
        });

        socket.on('uno:playerJoined', ({ players: ps }) => {
            setPlayers(ps);
            setJoining(false);
        });

        // lobbyId comes in the event payload - no stale closure
        socket.on('uno:gameStarted', ({ lobbyId: gameLobbyId }) => {
            navigate(`/uno/${gameLobbyId}`);
        });

        socket.on('uno:kicked', () => navigate('/dashboard'));

        socket.on('uno:error', (err) => {
            setError(err);
            setJoining(false);
            joinedRef.current = false; // allow retry on error
        });

        return () => {
            socket.off('uno:lobbyCreated');
            socket.off('uno:playerJoined');
            socket.off('uno:gameStarted');
            socket.off('uno:kicked');
            socket.off('uno:error');
        };
    }, [socket, navigate]);

    // ── Host: set initial player list from state once ──
    useEffect(() => {
        if (!isHost || !socket) return;
        // If we got here, the lobby was already created via Dashboard.
        // Players list will come from uno:lobbyCreated or playerJoined events.
        // But set a placeholder so the UI doesn't show empty:
        setPlayers(prev =>
            prev.length === 0
                ? [{ id: socket.id, username: user.username, avatar: '🃏', isHost: true }]
                : prev
        );
    }, [isHost, socket, user.username]);

    // ── Guest: emit joinLobby when socket and lobbyId are ready ──
    useEffect(() => {
        if (!socket || !lobbyId || isHost || joinedRef.current) return;
        joinedRef.current = true;
        setJoining(true);
        setError("");
        socket.emit('uno:joinLobby', {
            lobbyId,
            username: user.username,
            avatar: '🃏',
        });
    }, [socket, lobbyId, isHost, user.username]);

    const handleStart = () => {
        if (!socket || !lobbyId) return;
        socket.emit('uno:startGame', { lobbyId });
    };

    const handleKick = (targetId) => {
        socket.emit('uno:kickPlayer', { lobbyId, targetId });
    };

    const copyCode = () => {
        if (lobbyId) {
            navigator.clipboard.writeText(lobbyId);
        }
    };

    const handleRetryJoin = () => {
        if (!socket || !lobbyId) return;
        joinedRef.current = false;
        setError("");
        setJoining(true);
        joinedRef.current = true;
        socket.emit('uno:joinLobby', {
            lobbyId,
            username: user.username,
            avatar: '🃏',
        });
    };

    return (
        <div className="min-h-screen bg-plush text-amber-50 flex items-center justify-center p-4 font-serif relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-900/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-5xl w-full bg-black/80 border border-red-600/30 rounded-3xl p-8 lg:p-10 shadow-[0_0_60px_rgba(239,68,68,0.1)] relative z-10 backdrop-blur-xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/60 to-transparent rounded-t-3xl" />

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]" />
                            <span className="text-xs uppercase tracking-[0.3em] text-red-500/60 font-sans">UNO — Private Table</span>
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight">
                            <span className="text-red-500">U</span>
                            <span className="text-blue-500">N</span>
                            <span className="text-green-500">O</span>
                            <span className="text-yellow-400"> LOBBY</span>
                        </h2>
                    </div>

                    {lobbyId && (
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-xs uppercase tracking-widest text-gray-500 font-sans">Table Code</span>
                            <div
                                onClick={copyCode}
                                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2 rounded-xl cursor-pointer transition-all group"
                                title="Click to copy"
                            >
                                <span className="font-mono text-lg tracking-[0.2em] text-white group-hover:text-red-400 transition-colors">{lobbyId}</span>
                                <span className="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded border border-red-600/30 font-sans">Copy</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Error banner with retry */}
                {error && (
                    <div className="bg-red-900/20 border border-red-500/20 text-red-300 p-3 rounded-xl mb-6 text-center font-sans text-sm flex items-center justify-center gap-4">
                        <span>⚠️ {error}</span>
                        {!isHost && (
                            <button
                                onClick={handleRetryJoin}
                                className="bg-red-700 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-lg font-bold uppercase tracking-widest transition-colors"
                            >
                                Retry
                            </button>
                        )}
                    </div>
                )}

                {joining && !error && (
                    <div className="text-center text-yellow-500/60 text-sm font-sans mb-4 animate-pulse uppercase tracking-widest">
                        Joining table...
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Player Grid */}
                    <div className="lg:col-span-8">
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-5 font-sans border-b border-white/5 pb-2">Players</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {players.map((p, i) => (
                                <motion.div
                                    key={p.id || i}
                                    initial={{ scale: 0.85, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="relative flex items-center gap-3 bg-gradient-to-br from-gray-900 to-black border border-white/5 hover:border-red-500/30 rounded-xl p-4 group transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-full border border-red-500/30 bg-black flex items-center justify-center text-2xl">
                                        {p.avatar}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-white truncate">{p.username}</div>
                                        <div className="text-xs text-gray-500 font-sans uppercase tracking-wider">{p.isHost ? "Host" : "Guest"}</div>
                                    </div>
                                    {p.isHost && (
                                        <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded font-sans">HOST</div>
                                    )}
                                    {isHost && !p.isHost && (
                                        <button
                                            onClick={() => handleKick(p.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-red-500/60 hover:text-red-400 transition-all"
                                        >🚫</button>
                                    )}
                                </motion.div>
                            ))}

                            {/* Empty slots */}
                            {Array.from({ length: Math.max(0, maxPlayers - players.length) }).map((_, i) => (
                                <div key={`empty-${i}`} className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-white/10 opacity-30">
                                    <div className="w-12 h-12 rounded-full bg-white/5" />
                                    <div className="h-3 w-20 bg-white/5 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-6">
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-red-500/80 mb-4 font-sans">Game Info</h3>
                            <div className="space-y-2 text-sm font-sans text-gray-400">
                                <p>🃏 108 cards • Standard UNO rules</p>
                                <p>👥 {maxPlayers} players max</p>
                                <p>⚡ +2 / +4 stacking enabled</p>
                                <p>🎯 Wild Draw Four challenge</p>
                                <p>🔔 Say UNO at 1 card!</p>
                            </div>
                        </div>

                        <div className="bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col gap-4 items-center text-center mt-auto">
                            <p className="text-gray-400 font-sans text-xs uppercase tracking-widest">
                                {players.length < 2 ? "Waiting for players..." : "Ready to deal!"}
                            </p>

                            {isHost ? (
                                <button
                                    onClick={handleStart}
                                    disabled={players.length < 2}
                                    className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-[0.2em] transition-all duration-200 ${players.length < 2
                                            ? "bg-gray-800 text-gray-600 cursor-not-allowed border border-white/5"
                                            : "bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] border border-red-500/50"
                                        }`}
                                >
                                    Deal Cards
                                </button>
                            ) : (
                                <div className="text-gray-500 text-sm font-sans uppercase tracking-widest animate-pulse flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                                    Waiting for Host
                                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                                </div>
                            )}

                            <button
                                onClick={() => navigate('/dashboard')}
                                className="text-xs text-red-500/40 hover:text-red-400 font-bold font-sans uppercase tracking-widest transition-colors"
                            >
                                Leave Table
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
