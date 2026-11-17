import React, { useState, useEffect } from 'react';
import { getPublicPrayers, submitPrayerRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './PublicPrayers.css';

const PublicPrayers = () => {
    const { user } = useAuth();
    const [prayers, setPrayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        request: '',
        requesterName: '',
        requesterPhone: '',
        requesterEmail: '',
        isAnonymous: false,
        privacyLevel: 'Public'
    });

    const fetchPrayers = async () => {
        try {
            setLoading(true);
            const res = await getPublicPrayers();
            if (res.success) {
                setPrayers(res.prayers || []);
            }
        } catch (err) {
            console.error('Failed to load prayer requests:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrayers();
        if (user) {
            setFormData(prev => ({
                ...prev,
                requesterName: user.member?.fullName || user.churchId,
                requesterEmail: user.email || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMsg('');
        setErrorMsg('');
        setSubmitting(true);

        try {
            const res = await submitPrayerRequest(formData);
            if (res.success) {
                setSuccessMsg(res.message || 'Prayer request received. May the Lord bless and answer your request!');
                setFormData({
                    title: '',
                    request: '',
                    requesterName: user ? (user.member?.fullName || user.churchId) : '',
                    requesterPhone: '',
                    requesterEmail: user ? (user.email || '') : '',
                    isAnonymous: false,
                    privacyLevel: 'Public'
                });
                fetchPrayers();
            } else {
                setErrorMsg(res.message || 'Could not submit prayer request.');
            }
        } catch (err) {
            setErrorMsg(err.message || 'An error occurred.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="prayer-page">
            <div className="prayer-header">
                <h1>Intercessory Prayer Requests</h1>
                <p>
                    "Praying always with all prayer and supplication in the Spirit." — Ephesians 6:18
                    <br />
                    Share your burden, healing prayer, thanksgiving, or personal need with our church ministry.
                </p>
            </div>

            <div className="prayer-layout">
                {/* Form Section */}
                <div className="prayer-form-card">
                    <h2 className="prayer-form-title">Send a Prayer Request</h2>
                    <p className="prayer-form-desc">
                        Our pastoral team and 24/7 intercessory prayer warriors will stand in faith with you.
                    </p>

                    {successMsg && (
                        <div style={{
                            padding: '0.85rem 1rem',
                            borderRadius: '8px',
                            backgroundColor: '#DEF7EC',
                            color: '#03543F',
                            fontSize: '0.88rem',
                            marginBottom: '1rem',
                            border: '1px solid #31C48D'
                        }}>
                            ✅ {successMsg}
                        </div>
                    )}

                    {errorMsg && (
                        <div style={{
                            padding: '0.85rem 1rem',
                            borderRadius: '8px',
                            backgroundColor: '#FDE8E8',
                            color: '#9B1C1C',
                            fontSize: '0.88rem',
                            marginBottom: '1rem',
                            border: '1px solid #F98080'
                        }}>
                            ❌ {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Prayer Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Prayer for Divine Healing / Family Peace"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Prayer Description / Need *</label>
                            <textarea
                                name="request"
                                rows="4"
                                value={formData.request}
                                onChange={handleChange}
                                placeholder="Share details of your prayer request..."
                                required
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label>Privacy & Confidentiality Level *</label>
                            <select
                                name="privacyLevel"
                                value={formData.privacyLevel}
                                onChange={handleChange}
                            >
                                <option value="Public">Public (Visible on Church Prayer Wall)</option>
                                <option value="Prayer Team">Prayer Team (Church Intercessory Team Only)</option>
                                <option value="Pastor Only">Pastor Only (Strictly Confidential with Senior Pastor)</option>
                                <option value="Private">Private (Direct Pastoral Care)</option>
                            </select>
                            <p className="privacy-badge-info">
                                {formData.privacyLevel === 'Pastor Only' && '🔒 Strictly confidential: Handled exclusively by the Pastor.'}
                                {formData.privacyLevel === 'Prayer Team' && '👥 Shared only with the designated church intercessory prayer ministry.'}
                                {formData.privacyLevel === 'Public' && '🌐 Will appear on the public church prayer wall for all believers to pray.'}
                                {formData.privacyLevel === 'Private' && '🛡️ Kept private for administrative pastoral follow-up.'}
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Your Name</label>
                                <input
                                    type="text"
                                    name="requesterName"
                                    value={formData.requesterName}
                                    onChange={handleChange}
                                    disabled={formData.isAnonymous}
                                    placeholder={formData.isAnonymous ? 'Anonymous' : 'Your full name'}
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone / WhatsApp (Optional)</label>
                                <input
                                    type="tel"
                                    name="requesterPhone"
                                    value={formData.requesterPhone}
                                    onChange={handleChange}
                                    disabled={formData.isAnonymous}
                                    placeholder="+91..."
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <input
                                type="checkbox"
                                id="isAnonymous"
                                name="isAnonymous"
                                checked={formData.isAnonymous}
                                onChange={handleChange}
                                style={{ width: '18px', height: '18px' }}
                            />
                            <label htmlFor="isAnonymous" style={{ fontSize: '0.85rem', color: '#1B2A4E', cursor: 'pointer', margin: 0 }}>
                                Submit Anonymously (Hide my name from public display)
                            </label>
                        </div>

                        <button type="submit" disabled={submitting} className="prayer-submit-btn">
                            {submitting ? 'Submitting Prayer...' : '🙏 Submit Prayer Request'}
                        </button>
                    </form>
                </div>

                {/* Public Prayer Wall */}
                <div className="prayer-wall-section">
                    <h2 className="prayer-wall-title">
                        <span>🕊️</span> Church Prayer Wall & Testimonies
                    </h2>

                    {loading ? (
                        <p style={{ color: '#64748B' }}>Loading public prayer requests...</p>
                    ) : prayers.length === 0 ? (
                        <div style={{
                            padding: '2.5rem',
                            background: '#FFFFFF',
                            borderRadius: '14px',
                            textAlign: 'center',
                            border: '1px solid #E2E8F0'
                        }}>
                            <p style={{ color: '#64748B' }}>No public prayer requests currently listed. Be the first to submit!</p>
                        </div>
                    ) : (
                        <div className="prayer-wall-cards">
                            {prayers.map(p => (
                                <div key={p._id} className="prayer-item-card">
                                    <div className="prayer-item-top">
                                        <span className={`prayer-status-pill status-${p.status.replace(/\s+/g, '-')}`}>
                                            {p.status === 'Answered' ? '✨ Answered' : p.status === 'Under Prayer' ? '🕯️ Under Prayer' : '⏳ Pending Prayer'}
                                        </span>
                                        <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                                            {new Date(p.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h4 className="prayer-item-title">{p.title}</h4>
                                    <p className="prayer-item-desc">{p.request}</p>

                                    {p.status === 'Answered' && p.answeredTestimony && (
                                        <div className="prayer-item-testimony">
                                            <strong>Praise Report / Answer:</strong> {p.answeredTestimony}
                                        </div>
                                    )}

                                    <div className="prayer-item-footer">
                                        <span>Requested by: <strong>{p.requesterName}</strong></span>
                                        <span>🙏 Join in prayer</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicPrayers;
