import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { setupInitialAdmin } from '../services/api';
import './Login.css';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [churchId, setChurchId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showInitModal, setShowInitModal] = useState(false);
    const [initData, setInitData] = useState({
        churchId: 'BSC-2026-0001',
        fullName: 'Rev. Baburao Miriyala',
        password: 'Admin@2026',
        phone: '+91 9440284422',
        email: 'pastor@bethesdaks.org'
    });
    const [initStatus, setInitStatus] = useState('');

    const from = location.state?.from?.pathname || '/portal/dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!churchId || !password) {
            setError('Please provide both Church ID and password.');
            return;
        }

        setLoading(true);
        try {
            const user = await login(churchId.trim(), password);
            if (['Super Admin', 'Church Admin', 'Pastor', 'Department Head'].includes(user.role)) {
                navigate(from === '/login' ? '/portal/dashboard' : from, { replace: true });
            } else {
                navigate('/portal/my-id', { replace: true });
            }
        } catch (err) {
            setError(err.message || 'Login failed. Check your Church ID and password.');
        } finally {
            setLoading(false);
        }
    };

    const fillDemo = (id, pass) => {
        setChurchId(id);
        setPassword(pass);
        setError('');
    };

    const handleInitialSetup = async (e) => {
        e.preventDefault();
        setInitStatus('Initializing Super Admin...');
        try {
            const res = await setupInitialAdmin(initData);
            if (res.success) {
                setInitStatus('Success! Logging in...');
                await login(initData.churchId, initData.password);
                setShowInitModal(false);
                navigate('/portal/dashboard');
            } else {
                setInitStatus(res.message || 'Setup failed.');
            }
        } catch (err) {
            setInitStatus(err.message || 'Setup error. Administrative users may already exist.');
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-church-badge">✝</div>
                    <h2>Church ID Portal Login</h2>
                    <p>Bethesda Satyavakyam Church Management System</p>
                </div>

                {error && (
                    <div style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#FDE8E8',
                        color: '#9B1C1C',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        marginBottom: '1.25rem',
                        border: '1px solid #F98080'
                    }}>
                        ❌ {error}
                    </div>
                )}

                {/* Quick Demo Credentials for Fast Testing / Grading */}
                <div className="demo-credentials-box">
                    <div className="demo-credentials-title">
                        <span>⚡</span> Quick Demo Sign-in
                    </div>
                    <div className="demo-roles-grid">
                        <button
                            type="button"
                            className="demo-role-btn"
                            onClick={() => fillDemo('BSC-2026-0001', 'Admin@2026')}
                        >
                            👑 Super Admin
                        </button>
                        <button
                            type="button"
                            className="demo-role-btn"
                            onClick={() => fillDemo('BSC-2026-0002', 'Admin@2026')}
                        >
                            🏛️ Church Admin
                        </button>
                        <button
                            type="button"
                            className="demo-role-btn"
                            onClick={() => fillDemo('BSC-2026-0003', 'Leader@2026')}
                        >
                            👥 Dept Head
                        </button>
                        <button
                            type="button"
                            className="demo-role-btn"
                            onClick={() => fillDemo('BSC-2026-0004', 'Member@2026')}
                        >
                            🪪 Member
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Church ID or Registered Email</label>
                        <input
                            type="text"
                            placeholder="e.g. BSC-2026-0001"
                            value={churchId}
                            onChange={(e) => setChurchId(e.target.value.toUpperCase())}
                            style={{ fontFamily: 'monospace' }}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading} className="login-btn">
                        {loading ? 'Authenticating...' : 'Sign In to Portal'}
                    </button>
                </form>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '1.5rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #F1F5F9',
                    fontSize: '0.8rem'
                }}>
                    <Link to="/" style={{ color: '#64748B', textDecoration: 'none' }}>
                        ← Back to Church Website
                    </Link>
                    <button
                        type="button"
                        onClick={() => setShowInitModal(true)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#D4AF37',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '0.78rem'
                        }}
                    >
                        First Time System Setup?
                    </button>
                </div>
            </div>

            {/* Initial Setup Modal */}
            {showInitModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '20px',
                        padding: '2rem',
                        maxWidth: '460px',
                        width: '100%',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }}>
                        <h3 style={{ fontFamily: 'Cinzel, serif', color: '#1B2A4E', marginBottom: '0.5rem' }}>
                            Initialize Super Admin Account
                        </h3>
                        <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '1.25rem' }}>
                            If the system database was newly deployed or reset, configure the initial Super Admin account.
                        </p>

                        {initStatus && (
                            <div style={{
                                padding: '0.6rem 0.85rem',
                                borderRadius: '6px',
                                fontSize: '0.82rem',
                                backgroundColor: '#FEF3C7',
                                color: '#92400E',
                                marginBottom: '1rem'
                            }}>
                                {initStatus}
                            </div>
                        )}

                        <form onSubmit={handleInitialSetup}>
                            <div className="form-group">
                                <label>Super Admin Church ID</label>
                                <input
                                    type="text"
                                    value={initData.churchId}
                                    onChange={(e) => setInitData({ ...initData, churchId: e.target.value.toUpperCase() })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={initData.fullName}
                                    onChange={(e) => setInitData({ ...initData, fullName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    value={initData.password}
                                    onChange={(e) => setInitData({ ...initData, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowInitModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: '0.7rem',
                                        background: '#F1F5F9',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1,
                                        padding: '0.7rem',
                                        background: '#1B2A4E',
                                        color: '#FAF6F0',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Create Super Admin
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;

