import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('AuthProvider - useEffect, token:', token);
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        console.log('Fetching user with token:', token);
        try {
            const { data } = await api('/user', 'GET', null, token);
            console.log('Fetch user response:', data);
            setUser(data.user);
        } catch (error) {
            console.error('Fetch user failed:', error);
            localStorage.removeItem('token');
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
    try {
        const { data } = await api('/login', 'POST', { Email: email, Password: password });
        console.log('Login response data:', data); // ← tambahkan ini
        
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        console.log('Token saved to localStorage'); // ← tambahkan ini
        
        return { success: true, role: data.user.role };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: error.message };
    }
};

    const register = async (userData) => {
        try {
            const { data } = await api('/register', 'POST', userData);
            localStorage.setItem('token', data.token);
            setToken(data.token);
            setUser(data.user);
            return { success: true, role: data.user.role };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const logout = async () => {
        try {
            await api('/logout', 'POST', null, token);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};