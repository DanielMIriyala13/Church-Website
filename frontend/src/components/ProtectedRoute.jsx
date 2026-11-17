import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                color: '#1B2A4E',
                fontFamily: 'Cinzel, serif'
            }}>
                <div style={{
                    width: '45px',
                    height: '45px',
                    border: '4px solid #E5E7EB',
                    borderTop: '4px solid #D4AF37',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '1rem'
                }}></div>
                <p>Verifying authentication...</p>
                <style>{`
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return (
            <div style={{
                padding: '4rem 1.5rem',
                maxWidth: '600px',
                margin: '3rem auto',
                backgroundColor: '#fff',
                borderRadius: '16px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
                <h2 style={{ color: '#1B2A4E', fontFamily: 'Cinzel, serif', marginBottom: '0.75rem' }}>Access Restricted</h2>
                <p style={{ color: '#64748B', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    Your current role (<strong>{user.role}</strong>) does not have authorization to view this module.
                </p>
                <a
                    href="/portal"
                    style={{
                        display: 'inline-block',
                        padding: '0.75rem 1.75rem',
                        backgroundColor: '#1B2A4E',
                        color: '#FAF6F0',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontWeight: '600'
                    }}
                >
                    Return to Portal
                </a>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;

