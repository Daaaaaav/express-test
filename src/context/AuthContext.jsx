// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'; // Pastikan semua hook diimpor
import { message } from 'antd';
import BASE_URL from '../apiConfig';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('jwtToken') || null);
    const [authLoading, setAuthLoading] = useState(true);

    const checkAuthStatus = useCallback(async () => {
        setAuthLoading(true);
        const storedToken = localStorage.getItem('jwtToken');

        if (!storedToken) {
            setIsAuthenticated(false);
            setUser(null);
            setToken(null);
            setAuthLoading(false);
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/auth/status`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${storedToken}` },
                credentials: 'include'
            });

            if (!response.ok) {
                localStorage.removeItem('jwtToken');
                setIsAuthenticated(false);
                setUser(null);
                setToken(null);
            } else {
                const result = await response.json();
                if (result.loggedIn) {
                    setIsAuthenticated(true);
                    setUser(result.user);
                    setToken(storedToken);
                } else {
                    localStorage.removeItem('jwtToken');
                    setIsAuthenticated(false);
                    setUser(null);
                    setToken(null);
                }
            }
        } catch (error) {
            console.error("Failed to check auth status:", error);
            localStorage.removeItem('jwtToken');
            setIsAuthenticated(false);
            setUser(null);
            setToken(null);
        } finally {
            setAuthLoading(false);
        }
    }, []);

    const login = useCallback(async (email, password) => {
        try {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed. Please check your credentials.');
            }

            const result = await response.json();
            localStorage.setItem('jwtToken', result.token);
            setIsAuthenticated(true);
            setUser(result.user);
            setToken(result.token);
            message.success(result.message || 'Login successful!');
            return true;
        } catch (error) {
            console.error('Login error:', error);
            message.error(error.message || 'An unexpected error occurred during login.');
            setIsAuthenticated(false);
            setUser(null);
            setToken(null);
            return false;
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            const response = await fetch(`${BASE_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Logout failed.');
            }

            localStorage.removeItem('jwtToken');
            message.success('Logged out successfully!');
            setIsAuthenticated(false);
            setUser(null);
            setToken(null);
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            message.error(error.message || 'An unexpected error occurred during logout.');
            return false;
        }
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    const authContextValue = {
        isAuthenticated,
        user,
        token,
        authLoading,
        login,
        logout,
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};