
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_SERVER_URL || (import.meta.env.DEV ? "http://localhost:3001" : "");

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const res = await axios.post(`${API_BASE}/api/login`, { username, password });
            const userData = res.data.user;
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || "Login failed" };
        }
    };

    const register = async (username, password) => {
        try {
            const res = await axios.post(`${API_BASE}/api/register`, { username, password });
            const userData = res.data.user;
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || "Registration failed" };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
