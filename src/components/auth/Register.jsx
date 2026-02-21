
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";

export default function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [focusedField, setFocusedField] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const result = await register(username, password);
            if (result.success) {
                navigate("/dashboard");
            } else {
                setError(result.error || "Membership Application Failed");
            }
        } catch (err) {
            setError("Membership Application Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-plush flex items-center justify-center p-4 relative overflow-hidden font-serif text-amber-50">
            {/* Ambient Lighting */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-900/10 rounded-full blur-[120px]" />
            <div className="absolute top-[-20%] left-[-10%] w-[40vw] h-[40vw] bg-yellow-900/10 rounded-full blur-[100px]" />

            {/* Back to Home */}
            <Link to="/" className="absolute top-6 left-6 text-yellow-500/60 hover:text-yellow-400 text-sm font-sans tracking-widest uppercase transition-colors flex items-center gap-2">
                ← Back to Home
            </Link>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-black/80 border border-yellow-600/30 rounded-3xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-600/50 to-transparent" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-10 pointer-events-none" />

                    <div className="text-center mb-10">
                        <div className="inline-block mb-3">
                            <span className="text-5xl">✒️</span>
                        </div>
                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-700 tracking-wide uppercase">New Membership</h2>
                        <p className="text-yellow-100/40 text-sm mt-2 font-sans tracking-widest uppercase">Join the Inner Circle</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-900/20 border border-red-500/20 text-red-300 p-3 rounded-lg mb-6 text-center text-sm font-sans"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative group">
                            <label className={`absolute left-0 transition-all duration-300 pointer-events-none font-sans text-xs uppercase tracking-widest ${focusedField === 'username' || username ? '-top-5 text-yellow-500' : 'top-2 text-gray-500'}`}>
                                Alias
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full bg-transparent border-b border-white/10 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors placeholder-transparent font-sans"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onFocus={() => setFocusedField('username')}
                                onBlur={() => setFocusedField(null)}
                            />
                        </div>

                        <div className="relative group">
                            <label className={`absolute left-0 transition-all duration-300 pointer-events-none font-sans text-xs uppercase tracking-widest ${focusedField === 'password' || password ? '-top-5 text-yellow-500' : 'top-2 text-gray-500'}`}>
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                className="w-full bg-transparent border-b border-white/10 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors placeholder-transparent font-sans"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 mt-4 bg-gradient-to-r from-yellow-800 to-yellow-600 hover:from-yellow-700 hover:to-yellow-500 text-black font-bold text-sm uppercase tracking-[0.2em] rounded-lg shadow-lg hover:shadow-[0_0_20px_rgba(202,138,4,0.3)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Processing..." : "Sign the Book"}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm">
                        <span className="text-gray-500 font-sans">Already a member? </span>
                        <Link to="/login" className="text-yellow-500 hover:text-yellow-400 font-bold uppercase tracking-wider ml-2 underline decoration-yellow-500/30 hover:decoration-yellow-500">
                            Present Credentials
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
