import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAnnouncements } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './PublicAnnouncements.css';

const CATEGORIES = [
    'All',
    'General',
    'Sunday Service',
    'Youth',
    'Worship',
    'Special Event',
    'Urgent Notice',
    'Fasting & Prayer'
];

const PublicAnnouncements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const { isStaff } = useAuth();

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                setLoading(true);
                const params = selectedCategory !== 'All' ? { category: selectedCategory } : {};
                const data = await getAnnouncements(params);
                setAnnouncements(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to load announcements:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, [selectedCategory]);

    return (
        <div className="announcements-page">
            <div className="announcements-hero">
                <h1>Church Announcements</h1>
                <p>Stay informed with current notices, special services, fellowship updates, and blessed gatherings.</p>

                {isStaff && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <Link
                            to="/portal/announcements"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.6rem 1.2rem',
                                background: '#1B2A4E',
                                color: '#FAF6F0',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontSize: '0.88rem',
                                fontWeight: '600'
                            }}
                        >
                            ⚙️ Manage & Post Announcements
                        </Link>
                    </div>
                )}

                <div className="announcements-filter-bar">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#1B2A4E' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid #E2E8F0',
                        borderTop: '3px solid #D4AF37',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }}></div>
                    <p>Loading announcements...</p>
                </div>
            ) : announcements.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 1.5rem',
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                    maxWidth: '500px',
                    margin: '0 auto'
                }}>
                    <span style={{ fontSize: '3rem' }}>📢</span>
                    <h3 style={{ fontFamily: 'Cinzel, serif', color: '#1B2A4E', margin: '1rem 0 0.5rem' }}>
                        No Announcements Found
                    </h3>
                    <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                        There are currently no active announcements in the "{selectedCategory}" category.
                    </p>
                </div>
            ) : (
                <div className="announcements-grid">
                    {announcements.map(item => (
                        <article
                            key={item._id}
                            className={`announcement-card ${item.priority === 'high' ? 'high-priority' : item.priority === 'medium' ? 'medium-priority' : ''}`}
                        >
                            {item.posterUrl && (
                                <div className="announcement-poster">
                                    <img src={item.posterUrl} alt={item.title} />
                                </div>
                            )}
                            <div className="announcement-content">
                                <div className="announcement-meta">
                                    <span className="category-tag">{item.category || 'General'}</span>
                                    {item.priority && (
                                        <span className={`priority-badge priority-${item.priority}`}>
                                            {item.priority === 'high' ? '🔥 Urgent' : item.priority.toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <h3 className="announcement-title">{item.title}</h3>
                                <p className="announcement-body">{item.content}</p>
                                <div className="announcement-footer">
                                    <span>📅 {new Date(item.publishDate || item.createdAt).toLocaleDateString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}</span>
                                    <span>Audience: <strong>{item.targetAudience || 'All'}</strong></span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PublicAnnouncements;
