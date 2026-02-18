
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [focusedField, setFocusedField] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate("/dashboard");
        } catch (err) {
            setError("Access Denied: Invalid Credentials");
        }
    };

    return (
        <div className="min-h-screen bg-plush flex items-center justify-center p-4 relative overflow-hidden font-serif text-amber-50">
            {/* Ambient Lighting */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/10 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-black/80 border border-yellow-600/30 rounded-3xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden group">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-600/50 to-transparent" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-10 pointer-events-none" />

                    <div className="text-center mb-10">
                        <div className="inline-block mb-3">
                            <span className="text-5xl">🗝️</span>
                        </div>
                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-700 tracking-wide uppercase">Member Login</h2>
                        <p className="text-yellow-100/40 text-sm mt-2 font-sans tracking-widest uppercase">Presentation of Credentials Required</p>
                    </div>

                    {error && <div className="bg-red-900/20 border border-red-500/20 text-red-300 p-3 rounded-lg mb-6 text-center text-sm font-sans">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative group">
                            <label className={`absolute left-0 transition-all duration-300 pointer-events-none font-sans text-xs uppercase tracking-widest ${focusedField === 'email' || email ? '-top-5 text-yellow-500' : 'top-2 text-gray-500'}`}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                className="w-full bg-transparent border-b border-white/10 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors placeholder-transparent font-sans"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setFocusedField('email')}
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
                            className="w-full py-4 mt-4 bg-gradient-to-r from-yellow-800 to-yellow-600 hover:from-yellow-700 hover:to-yellow-500 text-black font-bold text-sm uppercase tracking-[0.2em] rounded-lg shadow-lg hover:shadow-[0_0_20px_rgba(202,138,4,0.3)] transition-all transform hover:-translate-y-0.5"
                        >
                            Present Credentials
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm">
                        <span className="text-gray-500 font-sans">Not on the guest list? </span>
                        <Link to="/register" className="text-yellow-500 hover:text-yellow-400 font-bold uppercase tracking-wider ml-2 underline decoration-yellow-500/30 hover:decoration-yellow-500">
                            Apply for Membership
                        </Link>
                    </div>
                </div>
            </motion.div>

            <style>{`
                @keyframes grid-move {
                    0% { transform: perspective(500px) rotateX(60deg) translateY(0) translateZ(-200px); }
                    100% { transform: perspective(500px) rotateX(60deg) translateY(40px) translateZ(-200px); }
                }
            `}</style>
        </div >
    );
}
