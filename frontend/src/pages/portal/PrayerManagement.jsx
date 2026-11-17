import React, { useState, useEffect, useCallback } from 'react';
import PortalLayout from '../../components/PortalLayout';
import {
    getManagementPrayers,
    updatePrayerStatus,
    deletePrayerRequest
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PrayerManagement = () => {
    const { isPastor, isSuperAdmin } = useAuth();
    const [prayers, setPrayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPrivacy, setFilterPrivacy] = useState('');
    const [search, setSearch] = useState('');

    // Update Status Modal
    const [activePrayer, setActivePrayer] = useState(null);
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [newStatus, setNewStatus] = useState('Under Prayer');
    const [testimony, setTestimony] = useState('');
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    const loadPrayers = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (filterStatus) params.status = filterStatus;
            if (filterPrivacy) params.privacyLevel = filterPrivacy;
            if (search) params.search = search;

            const res = await getManagementPrayers(params);
            if (res.success) {
                setPrayers(res.prayers || []);
            }
        } catch (err) {
            console.error('Failed to load management prayers:', err);
        } finally {
            setLoading(false);
        }
    }, [filterStatus, filterPrivacy, search]);

    useEffect(() => {
        loadPrayers();
    }, [loadPrayers]);

    const openStatusModal = (prayer) => {
        setActivePrayer(prayer);
        setNewStatus(prayer.status);
        setTestimony(prayer.answeredTestimony || '');
        setNotes(prayer.pastorNotes || '');
        setStatusModalOpen(true);
    };

    const handleSaveStatus = async (e) => {
        e.preventDefault();
        if (!activePrayer) return;
        setSaving(true);
        try {
            await updatePrayerStatus(activePrayer._id, {
                status: newStatus,
                answeredTestimony: testimony,
                pastorNotes: notes
            });
            setStatusModalOpen(false);
            loadPrayers();
        } catch (err) {
            alert(err.message || 'Failed to update prayer status.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Delete prayer request "${title}"?`)) return;
        try {
            await deletePrayerRequest(id);
            loadPrayers();
        } catch (err) {
            alert(err.message || 'Error deleting request.');
        }
    };

    return (
        <PortalLayout title="Prayer Ministry & Requests Management">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Filter Bar */}
                <div style={{
                    background: '#FFFFFF',
                    padding: '1.25rem 1.5rem',
                    borderRadius: '14px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
                        <input
                            type="text"
                            placeholder="🔍 Search prayer subject or requester..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                padding: '0.65rem 1rem',
                                border: '1px solid #CBD5E1',
                                borderRadius: '8px',
                                minWidth: '220px',
                                flex: 1
                            }}
                        />

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                        >
                            <option value="">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Under Prayer">Under Prayer</option>
                            <option value="Answered">Answered</option>
                        </select>

                        <select
                            value={filterPrivacy}
                            onChange={(e) => setFilterPrivacy(e.target.value)}
                            style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                        >
                            <option value="">All Privacy Levels</option>
                            <option value="Public">Public Wall</option>
                            <option value="Prayer Team">Prayer Team</option>
                            <option value="Private">Private</option>
                            {(isPastor || isSuperAdmin) && (
                                <option value="Pastor Only">🔒 Pastor Only (Confidential)</option>
                            )}
                        </select>
                    </div>

                    <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>
                        {prayers.length} Requests Filtered
                    </span>
                </div>

                {/* Prayer List */}
                <div style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.04)'
                }}>
                    {loading ? (
                        <p style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>Loading requests...</p>
                    ) : prayers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3.5rem', color: '#64748B' }}>
                            <span style={{ fontSize: '2.5rem' }}>🙏</span>
                            <p style={{ marginTop: '0.5rem' }}>No prayer requests found matching your filters.</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                            <thead>
                                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#64748B' }}>
                                    <th style={{ padding: '0.85rem 1rem' }}>Title & Need</th>
                                    <th style={{ padding: '0.85rem 1rem' }}>Requester</th>
                                    <th style={{ padding: '0.85rem 1rem' }}>Privacy</th>
                                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                                    <th style={{ padding: '0.85rem 1rem' }}>Date</th>
                                    <th style={{ padding: '0.85rem 1rem' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {prayers.map(p => (
                                    <tr key={p._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <td style={{ padding: '0.85rem 1rem', maxWidth: '300px' }}>
                                            <div style={{ fontWeight: '600', color: '#1B2A4E', marginBottom: '2px' }}>
                                                {p.title}
                                            </div>
                                            <div style={{
                                                fontSize: '0.8rem',
                                                color: '#64748B',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {p.request}
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem' }}>
                                            <div style={{ fontWeight: '500' }}>{p.isAnonymous ? 'Anonymous' : p.requesterName}</div>
                                            {p.requesterPhone && (
                                                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{p.requesterPhone}</div>
                                            )}
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem' }}>
                                            <span style={{
                                                fontSize: '0.72rem',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontWeight: '600',
                                                background: p.privacyLevel === 'Pastor Only' ? '#FEE2E2' : p.privacyLevel === 'Prayer Team' ? '#DBEAFE' : '#F1F5F9',
                                                color: p.privacyLevel === 'Pastor Only' ? '#991B1B' : p.privacyLevel === 'Prayer Team' ? '#1E40AF' : '#475569'
                                            }}>
                                                {p.privacyLevel === 'Pastor Only' ? '🔒 Pastor Only' : p.privacyLevel}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem' }}>
                                            <span style={{
                                                fontSize: '0.72rem',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontWeight: '700',
                                                background: p.status === 'Answered' ? '#DEF7EC' : p.status === 'Under Prayer' ? '#DBEAFE' : '#FEF3C7',
                                                color: p.status === 'Answered' ? '#03543F' : p.status === 'Under Prayer' ? '#1E40AF' : '#92400E'
                                            }}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem', color: '#64748B', fontSize: '0.8rem' }}>
                                            {new Date(p.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => openStatusModal(p)}
                                                    style={{
                                                        padding: '0.35rem 0.65rem',
                                                        borderRadius: '6px',
                                                        border: '1px solid #CBD5E1',
                                                        background: '#FFFFFF',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    ⚙️ Status
                                                </button>
                                                {(isPastor || isSuperAdmin) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(p._id, p.title)}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            color: '#EF4444'
                                                        }}
                                                    >
                                                        🗑️
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Status Update Modal */}
            {statusModalOpen && activePrayer && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '20px',
                        maxWidth: '520px',
                        width: '100%',
                        padding: '2rem'
                    }}>
                        <h3 style={{ fontFamily: 'Cinzel, serif', color: '#1B2A4E', marginBottom: '0.5rem' }}>
                            Update Prayer Request Status
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
                            <strong>{activePrayer.title}</strong> by {activePrayer.requesterName}
                        </p>

                        <form onSubmit={handleSaveStatus}>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                                    Prayer Status
                                </label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Under Prayer">Under Prayer</option>
                                    <option value="Answered">Answered</option>
                                </select>
                            </div>

                            {newStatus === 'Answered' && (
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                                        Answered Testimony / Praise Report
                                    </label>
                                    <textarea
                                        rows="3"
                                        placeholder="Record how God answered this prayer request..."
                                        value={testimony}
                                        onChange={(e) => setTestimony(e.target.value)}
                                        style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                                    ></textarea>
                                </div>
                            )}

                            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                                    Pastoral / Internal Notes
                                </label>
                                <textarea
                                    rows="2"
                                    placeholder="Internal pastoral follow-up notes..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                                ></textarea>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setStatusModalOpen(false)}
                                    style={{
                                        padding: '0.6rem 1.2rem',
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
                                    disabled={saving}
                                    style={{
                                        padding: '0.6rem 1.25rem',
                                        background: '#1B2A4E',
                                        color: '#FAF6F0',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {saving ? 'Saving...' : 'Save Status'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </PortalLayout>
    );
};

export default PrayerManagement;
