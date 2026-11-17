import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './PortalLayout.css';

const PortalLayout = ({ children, title }) => {
    const { user, logout, isStaff } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    const initials = user?.member?.fullName
        ? user.member.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : (user?.churchId ? user.churchId.substring(0, 3) : 'U');

    return (
        <div className="portal-container">
            {/* Sidebar */}
            <aside className={`portal-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="portal-sidebar-header">
                    <Link to="/portal" className="portal-brand" onClick={closeSidebar}>
                        <div className="portal-brand-logo">BSC</div>
                        <div className="portal-brand-text">
                            <h3>Bethesda CMS</h3>
                            <span>Management Portal</span>
                        </div>
                    </Link>
                </div>

                {/* User Card */}
                <div className="portal-user-badge">
                    <div className="portal-avatar">
                        {user?.member?.photo ? (
                            <img src={user.member.photo} alt={user.member.fullName} />
                        ) : (
                            <span>{initials}</span>
                        )}
                    </div>
                    <div className="portal-user-info">
                        <div className="portal-user-name" title={user?.member?.fullName || user?.churchId}>
                            {user?.member?.fullName || user?.churchId}
                        </div>
                        <div className="portal-user-id">{user?.churchId}</div>
                        <span className="portal-role-tag">{user?.role}</span>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="portal-nav">
                    {/* Management Navigation for Staff */}
                    {isStaff ? (
                        <>
                            <div className="portal-nav-section-title">Administration</div>
                            <NavLink to="/portal/dashboard" className={({ isActive }) => `portal-nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                                <span className="portal-nav-icon">📊</span>
                                Dashboard
                            </NavLink>

                            <NavLink to="/portal/members" className={({ isActive }) => `portal-nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                                <span className="portal-nav-icon">👥</span>
                                Church IDs & Members
                            </NavLink>

                            <NavLink to="/portal/attendance" className={({ isActive }) => `portal-nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                                <span className="portal-nav-icon">📅</span>
                                Attendance & Check-in
                            </NavLink>

                            <NavLink to="/portal/departments" className={({ isActive }) => `portal-nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                                <span className="portal-nav-icon">🏛️</span>
                                Departments
                            </NavLink>

                            <NavLink to="/portal/announcements" className={({ isActive }) => `portal-nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                                <span className="portal-nav-icon">📢</span>
                                Announcements
                            </NavLink>

                            <NavLink to="/portal/prayers" className={({ isActive }) => `portal-nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                                <span className="portal-nav-icon">🙏</span>
                                Prayer Requests
                            </NavLink>
                        </>
                    ) : null}

                    {/* Member Portal navigation for regular members or quick view */}
                    <div className="portal-nav-section-title">Member Services</div>
                    <NavLink to="/portal/my-id" className={({ isActive }) => `portal-nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                        <span className="portal-nav-icon">🪪</span>
                        My Digital ID Card
                    </NavLink>

                    <NavLink to="/prayers" className="portal-nav-link" onClick={closeSidebar}>
                        <span className="portal-nav-icon">✨</span>
                        Submit Prayer Request
                    </NavLink>

                    <NavLink to="/announcements" className="portal-nav-link" onClick={closeSidebar}>
                        <span className="portal-nav-icon">📰</span>
                        Church Notice Board
                    </NavLink>
                </nav>

                {/* Footer Controls */}
                <div className="portal-sidebar-footer">
                    <Link to="/" className="portal-btn-ghost">
                        <span>🌐</span> View Public Website
                    </Link>
                    <button onClick={handleLogout} className="portal-btn-ghost" style={{ color: '#F87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                        <span>🚪</span> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <main className="portal-main">
                <header className="portal-topbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button className="portal-mobile-toggle" onClick={toggleSidebar} aria-label="Toggle menu">
                            ☰
                        </button>
                        <h1 className="portal-topbar-title">{title || 'Church Management System'}</h1>
                    </div>

                    <div className="portal-topbar-actions">
                        <Link
                            to="/portal/my-id"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.45rem 0.9rem',
                                borderRadius: '20px',
                                background: '#FAF6F0',
                                border: '1px solid #D4AF37',
                                color: '#1B2A4E',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                textDecoration: 'none'
                            }}
                        >
                            <span>🪪</span>
                            <span>{user?.churchId}</span>
                        </Link>
                    </div>
                </header>

                <div className="portal-content">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default PortalLayout;
