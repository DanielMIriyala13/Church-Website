import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, getMe } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('church_cms_token') || null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem('church_cms_token');
        setToken(null);
        setUser(null);
    }, []);

    const fetchUserProfile = useCallback(async () => {
        try {
            if (!token) {
                setLoading(false);
                return;
            }
            const res = await getMe();
            if (res.success && res.user) {
                setUser(res.user);
            } else {
                logout();
            }
        } catch (err) {
            console.error('Session expired or error loading profile:', err.message);
            logout();
        } finally {
            setLoading(false);
        }
    }, [token, logout]);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    const login = async (churchId, password) => {
        const res = await apiLogin(churchId, password);
        if (res.success && res.token) {
            localStorage.setItem('church_cms_token', res.token);
            setToken(res.token);
            setUser(res.user);
            return res.user;
        } else {
            throw new Error(res.message || 'Login failed');
        }
    };

    const hasRole = (...roles) => {
        if (!user || !user.role) return false;
        return roles.includes(user.role);
    };

    const isSuperAdmin = user?.role === 'Super Admin';
    const isChurchAdmin = ['Super Admin', 'Church Admin'].includes(user?.role);
    const isPastor = ['Super Admin', 'Pastor'].includes(user?.role);
    const isDeptHead = user?.role === 'Department Head';
    const isStaff = ['Super Admin', 'Church Admin', 'Pastor', 'Department Head'].includes(user?.role);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                logout,
                hasRole,
                isSuperAdmin,
                isChurchAdmin,
                isPastor,
                isDeptHead,
                isStaff,
                refreshProfile: fetchUserProfile
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
