import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const { user, logout, isStaff } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-container">
                <Link to="/" className="navbar-logo" onClick={closeMenu}>
                    Bethesda Satyavakyam
                </Link>

                <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
                    <li className="nav-item">
                        <Link to="/" className={`nav-link ${isActive('/')}`} onClick={closeMenu}>
                            Home
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/about" className={`nav-link ${isActive('/about')}`} onClick={closeMenu}>
                            About
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/jubilee" className={`nav-link ${isActive('/jubilee')}`} onClick={closeMenu}>
                            Anniversary
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/events" className={`nav-link ${isActive('/events')}`} onClick={closeMenu}>
                            Events
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/announcements" className={`nav-link ${isActive('/announcements')}`} onClick={closeMenu}>
                            Notices
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/prayers" className={`nav-link ${isActive('/prayers')}`} onClick={closeMenu}>
                            Prayer Wall
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/gallery" className={`nav-link ${isActive('/gallery')}`} onClick={closeMenu}>
                            Gallery
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/contact" className={`nav-link ${isActive('/contact')}`} onClick={closeMenu}>
                            Contact
                        </Link>
                    </li>

                    {/* Mobile Only Login / Portal Link */}
                    <li className="nav-item mobile-portal-link" style={{ display: 'none' }}>
                        {user ? (
                            <Link to={isStaff ? '/portal/dashboard' : '/portal/my-id'} className="nav-link" onClick={closeMenu}>
                                🏛️ Portal ({user.churchId})
                            </Link>
                        ) : (
                            <Link to="/login" className="nav-link" onClick={closeMenu}>
                                🔐 Portal Login
                            </Link>
                        )}
                    </li>
                </ul>

                {/* Social & Portal Action Group */}
                <div className="navbar-icons-group" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <a
                        href="https://www.youtube.com/@BCS_BaburaoMiriyala"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="navbar-icon navbar-youtube"
                        aria-label="Visit our YouTube channel"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                    </a>

                    <a
                        href="https://www.google.com/maps/place/LEF+Bethesda+Church+Kadapa+City/@14.4786512,78.8028147,17.7z/data=!4m6!3m5!1s0x3bb37225f8fd6429:0x56c13c7bfee5987c!8m2!3d14.4770208!4d78.8044443!16s%2Fg%2F11f5djywlp"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="navbar-icon navbar-map"
                        aria-label="View church location on Google Maps"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                    </a>

                    {/* Portal / Login Button */}
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Link
                                to={isStaff ? '/portal/dashboard' : '/portal/my-id'}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    padding: '0.45rem 0.9rem',
                                    background: 'linear-gradient(135deg, #1B2A4E 0%, #2A3F6D 100%)',
                                    color: '#D4AF37',
                                    borderRadius: '20px',
                                    fontSize: '0.82rem',
                                    fontWeight: '700',
                                    textDecoration: 'none',
                                    border: '1px solid #D4AF37',
                                    boxShadow: '0 2px 10px rgba(212, 175, 55, 0.2)'
                                }}
                            >
                                <span>🏛️</span>
                                <span>{user.churchId}</span>
                            </Link>
                            <button
                                onClick={logout}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    color: '#64748B',
                                    padding: '0.25rem 0.5rem'
                                }}
                                title="Sign Out"
                            >
                                🚪
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.45rem 1rem',
                                background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                                color: '#1B2A4E',
                                borderRadius: '20px',
                                fontSize: '0.82rem',
                                fontWeight: '700',
                                textDecoration: 'none',
                                boxShadow: '0 2px 10px rgba(212, 175, 55, 0.3)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <span>🔐</span>
                            <span>Portal Login</span>
                        </Link>
                    )}
                </div>

                <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
