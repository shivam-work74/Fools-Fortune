
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import { useVoice } from "../context/VoiceContext";
import { motion } from "framer-motion";

const AVATARS = ["😎", "🤖", "🦊", "👽", "🤠", "👻", "🦄", "🐱"];

export default function Lobby() {
    const { state } = useLocation(); // { lobbyId, isHost }
    const { user } = useAuth();
    const { myPeerId, callUser, isMuted, toggleMute, isSpeakerEnabled, toggleSpeaker, repairAudio, testMic } = useVoice();
    const socket = useSocket();
    const navigate = useNavigate();

    const [players, setPlayers] = useState([]);
    const [lobbyId, setLobbyId] = useState(state?.lobbyId || "");
    const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
    const [error, setError] = useState("");
    const [settings, setSettings] = useState({
        speedProtocol: false,
        blindFaith: false,
        jokersWild: false
    });

    useEffect(() => {
        if (!socket || !lobbyId || !myPeerId) return;

        // If joiner, emit join
        if (!state?.isHost) {
            socket.emit('joinLobby', { lobbyId, username: user.username, avatar: selectedAvatar, peerId: myPeerId });
        } else {
            // If host, we already created lobby but might need to broadcast peerId if we just got it
            if (myPeerId) {
                socket.emit('joinLobby', { lobbyId, username: user.username, avatar: "🎩", peerId: myPeerId });
            }
        }

        socket.on('playerJoined', ({ players }) => {
            setPlayers(players);
            // Auto-call new players who have a peerId
            players.forEach(p => {
                if (p.username !== user.username && p.peerId) {
                    // Only call if my username is less than theirs (lexicographical)
                    // This ensures only one person starts the call between any pair
                    if (user.username < p.username) {
                        callUser(p.username, p.peerId);
                    }
                }
            });
        });

        socket.on('lobbyCreated', ({ players }) => {
            setPlayers(players);
        });

        socket.on('settingsUpdated', (newSettings) => {
            setSettings(newSettings);
        });

        socket.on('kicked', () => {
            navigate('/dashboard');
            alert("You have been removed from the suite.");
        });

        socket.on('gameStarted', () => {
            navigate(`/game/${lobbyId}`);
        });

        socket.on('error', (err) => setError(err));

        return () => {
            socket.off('playerJoined');
            socket.off('lobbyCreated');
            socket.off('settingsUpdated');
            socket.off('kicked');
            socket.off('gameStarted');
            socket.off('error');
        };
    }, [socket, lobbyId, state, user, selectedAvatar, navigate]);


    const handleStart = () => {
        socket.emit('startGame', { lobbyId });
    };

    const handleKick = (playerId) => {
        if (window.confirm("Remove this guest from the suite?")) {
            socket.emit('kickPlayer', { lobbyId, targetId: playerId });
        }
    };

    const toggleSetting = (key) => {
        if (!state?.isHost) return;
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings);
        socket.emit('updateSettings', { lobbyId, settings: newSettings });
    };

    const copyCode = () => {
        navigator.clipboard.writeText(lobbyId);
        alert("Invitation Code copied to clipboard.");
    };

    return (
        <div className="min-h-screen bg-plush text-amber-50 flex items-center justify-center p-4 font-serif relative overflow-hidden">
            {/* Ambient Lighting */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl w-full bg-black/80 border-gold rounded-3xl p-8 lg:p-10 shadow-plush relative z-10 backdrop-blur-xl">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-yellow-600/50 to-transparent" />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                            <span className="text-xs uppercase tracking-[0.3em] text-yellow-500/60 font-sans">Secure Channel</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gold tracking-tight">PRIVATE SUITE</h2>
                    </div>

                    <div className="flex gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
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

                    <div className="flex flex-col items-end gap-2">
                        <span className="text-xs uppercase tracking-widest text-gray-500 font-sans">VIP Access Code</span>
                        <div
                            className="flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-2 rounded-xl cursor-pointer transition-all group"
                            onClick={copyCode}
                        >
                            <span className="font-mono text-2xl tracking-[0.2em] text-white group-hover:text-gold transition-colors">{lobbyId}</span>
                            <span className="text-xs uppercase bg-yellow-600/20 text-yellow-500 px-3 py-1 rounded border border-yellow-600/30">Copy</span>
                        </div>
                    </div>
                </div>

                {error && <div className="bg-red-900/20 border border-red-500/20 text-red-300 p-4 rounded-xl mb-8 text-center font-sans">{error}</div>}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* LEFT PANEL: Player List (8 cols) */}
                    <div className="lg:col-span-8">
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-6 font-sans border-b border-white/5 pb-2">Guest List</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {players.map((p, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                    className="relative flex items-center gap-4 bg-gradient-to-br from-gray-900 to-black p-4 rounded-xl border border-white/5 hover:border-yellow-500/30 transition-colors group shadow-lg overflow-hidden"
                                >
                                    <div className="relative">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-b from-gray-800 to-black p-0.5 border border-yellow-500/30">
                                            <div className="w-full h-full rounded-full flex items-center justify-center text-2xl bg-black/50">
                                                {p.avatar || "👤"}
                                            </div>
                                        </div>
                                        {p.isHost && (
                                            <div className="absolute -bottom-1 -right-1 bg-yellow-600 text-black text-[10px] font-bold px-1.5 py-0.5 rounded border border-yellow-400 shadow-sm">
                                                HOST
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-lg text-white group-hover:text-gold transition-colors">{p.username}</div>
                                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider font-sans">
                                            {p.isHost ? "Suite Owner" : "Invited Guest"}
                                        </div>
                                    </div>

                                    {/* The Bouncer (Kick Button) */}
                                    {state?.isHost && !p.isHost && (
                                        <button
                                            onClick={() => handleKick(p.id)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-red-900/20 hover:bg-red-900/50 text-red-500 p-2 rounded-lg transition-all border border-red-500/20"
                                            title="Remove Guest"
                                        >
                                            🚫
                                        </button>
                                    )}
                                </motion.div>
                            ))}

                            {/* Empty slots */}
                            {[...Array(Math.max(0, 4 - players.length))].map((_, i) => (
                                <div key={`empty-${i}`} className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-white/10 opacity-30 select-none">
                                    <div className="w-14 h-14 rounded-full bg-white/5" />
                                    <div className="h-4 w-24 bg-white/5 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT PANEL: Settings & Controls (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">

                        {/* House Rules */}
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gold font-sans">House Rules</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={testMic}
                                        className="bg-blue-600/20 hover:bg-blue-600/40 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border border-blue-500/20 transition-all shadow-sm"
                                    >
                                        Mic Test
                                    </button>
                                    <button
                                        onClick={repairAudio}
                                        className="bg-white/5 hover:bg-white/10 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border border-white/10 transition-all opacity-40 hover:opacity-100 shadow-sm"
                                    >
                                        Repair Audio
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-white/5">
                                    <div>
                                        <div className="text-sm font-bold text-gray-200">Speed Protocol</div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">10s Turn Timer</div>
                                    </div>
                                    <button
                                        disabled={!state?.isHost}
                                        onClick={() => toggleSetting('speedProtocol')}
                                        className={`w-10 h-6 rounded-full p-1 transition-colors ${settings.speedProtocol ? 'bg-yellow-600' : 'bg-gray-700'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${settings.speedProtocol ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-white/5">
                                    <div>
                                        <div className="text-sm font-bold text-gray-200">Blind Faith</div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Shuffle on Turn</div>
                                    </div>
                                    <button
                                        disabled={!state?.isHost}
                                        onClick={() => toggleSetting('blindFaith')}
                                        className={`w-10 h-6 rounded-full p-1 transition-colors ${settings.blindFaith ? 'bg-purple-600' : 'bg-gray-700'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${settings.blindFaith ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="bg-gradient-to-b from-gray-800/40 to-black/40 border border-white/5 rounded-2xl p-8 text-center backdrop-blur-sm mt-auto">
                            <h4 className="text-gray-400 font-sans text-xs uppercase tracking-widest mb-4">Suite Status</h4>
                            <div className="text-2xl font-light italic text-yellow-100/80 mb-8">
                                {players.length < 2 ? "Awaiting guests..." : "Table is ready."}
                            </div>

                            {state?.isHost ? (
                                <button
                                    onClick={handleStart}
                                    disabled={players.length < 2}
                                    className={`w-full py-4 rounded-xl font-bold text-lg uppercase tracking-[0.2em] transition-all duration-300 relative overflow-hidden group ${players.length < 2 ? "bg-gray-800 text-gray-600 cursor-not-allowed border border-white/5" : "bg-gradient-to-r from-yellow-600 to-yellow-700 text-black hover:shadow-[0_0_30px_rgba(202,138,4,0.3)] shadow-[0_0_15px_rgba(202,138,4,0.1)] border border-yellow-500/50"}`}
                                >
                                    <span className="relative z-10">Deal Cards</span>
                                    {players.length >= 2 && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />}
                                </button>
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="flex items-center justify-center gap-2 text-gray-500 text-sm font-sans uppercase tracking-widest animate-pulse">
                                        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                                        Waiting for Host
                                        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                                    </div>
                                    <button
                                        onClick={() => socket.emit('joinSpectator', { lobbyId, username: user.username })}
                                        className="text-xs text-yellow-600/50 hover:text-yellow-500 uppercase font-bold tracking-widest border-b border-transparent hover:border-yellow-500/50 transition-all font-sans"
                                    >
                                        Join as Spectator
                                    </button>
                                </div>
                            )}

                            <button onClick={() => navigate('/dashboard')} className="mt-6 text-xs text-red-500/50 hover:text-red-400 uppercase font-bold tracking-widest border-b border-transparent hover:border-red-500/50 transition-all font-sans">
                                Leave Suite
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

