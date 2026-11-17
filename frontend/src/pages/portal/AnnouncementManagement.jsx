import React, { useState, useEffect, useCallback } from 'react';
import PortalLayout from '../../components/PortalLayout';
import {
    getAdminAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    updateAnnouncementStatus,
    deleteAnnouncement
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = [
    'General',
    'Sunday Service',
    'Youth',
    'Worship',
    'Special Event',
    'Urgent Notice',
    'Fasting & Prayer'
];

const AnnouncementManagement = () => {
    const { isChurchAdmin } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [search, setSearch] = useState('');

    // Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'General',
        priority: 'medium',
        posterUrl: '',
        publishDate: new Date().toISOString().split('T')[0],
        status: 'published',
        targetAudience: 'All'
    });
    const [saving, setSaving] = useState(false);

    const loadAnnouncements = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter !== 'All') params.status = statusFilter;
            if (search) params.search = search;

            const res = await getAdminAnnouncements(params);
            if (res.success) {
                setAnnouncements(res.announcements || []);
            }
        } catch (err) {
            console.error('Failed to load announcements:', err);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, search]);

    useEffect(() => {
        loadAnnouncements();
    }, [loadAnnouncements]);

    const openCreateModal = () => {
        setIsEditing(false);
        setFormData({
            title: '',
            content: '',
            category: 'General',
            priority: 'medium',
            posterUrl: '',
            publishDate: new Date().toISOString().split('T')[0],
            status: 'published',
            targetAudience: 'All'
        });
        setModalOpen(true);
    };

    const openEditModal = (item) => {
        setIsEditing(true);
        setFormData({
            _id: item._id,
            title: item.title,
            content: item.content,
            category: item.category || 'General',
            priority: item.priority || 'medium',
            posterUrl: item.posterUrl || '',
            publishDate: item.publishDate ? new Date(item.publishDate).toISOString().split('T')[0] : '',
            status: item.status || 'published',
            targetAudience: item.targetAudience || 'All'
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isEditing) {
                await updateAnnouncement(formData._id, formData);
            } else {
                await createAnnouncement(formData);
            }
            setModalOpen(false);
            loadAnnouncements();
        } catch (err) {
            alert(err.message || 'Operation failed.');
        } finally {
            setSaving(false);
        }
    };

    const handleQuickStatus = async (id, status) => {
        try {
            await updateAnnouncementStatus(id, status);
            loadAnnouncements();
        } catch (err) {
            alert(err.message || 'Failed to change status.');
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Permanently delete announcement "${title}"?`)) return;
        try {
            await deleteAnnouncement(id);
            loadAnnouncements();
        } catch (err) {
            alert(err.message || 'Error deleting announcement.');
        }
    };

    return (
        <PortalLayout title="Announcements & Notices Management">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                            placeholder="🔍 Search announcements..."
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
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                        >
                            <option value="All">All Statuses</option>
                            <option value="published">Published</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="archived">Archived</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        style={{
                            padding: '0.65rem 1.25rem',
                            background: '#1B2A4E',
                            color: '#FAF6F0',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <span>➕</span> Post New Notice
                    </button>
                </div>

                <div style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.04)'
                }}>
                    {loading ? (
                        <p style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>Loading notices...</p>
                    ) : announcements.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                            <span style={{ fontSize: '2.5rem' }}>📢</span>
                            <p style={{ marginTop: '0.5rem' }}>No announcements found.</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                            <thead>
                                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#64748B' }}>
                                    <th style={{ padding: '0.85rem 1rem' }}>Title & Content</th>
                                    <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                                    <th style={{ padding: '0.85rem 1rem' }}>Priority</th>
                                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                                    <th style={{ padding: '0.85rem 1rem' }}>Date</th>
                                    <th style={{ padding: '0.85rem 1rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {announcements.map(item => (
                                    <tr key={item._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <td style={{ padding: '0.85rem 1rem', maxWidth: '340px' }}>
                                            <div style={{ fontWeight: '600', color: '#1B2A4E', marginBottom: '3px' }}>
                                                {item.title}
                                            </div>
                                            <div style={{
                                                fontSize: '0.8rem',
                                                color: '#64748B',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {item.content}
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem' }}>
                                            <span style={{
                                                fontSize: '0.72rem',
                                                fontWeight: '600',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                background: '#F1F5F9',
                                                color: '#475569'
                                            }}>
                                                {item.category}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem' }}>
                                            <span style={{
                                                fontSize: '0.72rem',
                                                fontWeight: '700',
                                                color: item.priority === 'high' ? '#DC2626' : item.priority === 'medium' ? '#D97706' : '#2563EB'
                                            }}>
                                                {item.priority?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem' }}>
                                            <select
                                                value={item.status || 'published'}
                                                onChange={(e) => handleQuickStatus(item._id, e.target.value)}
                                                style={{
                                                    fontSize: '0.78rem',
                                                    padding: '2px 6px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #CBD5E1',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                <option value="published">Published</option>
                                                <option value="scheduled">Scheduled</option>
                                                <option value="archived">Archived</option>
                                                <option value="draft">Draft</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem', color: '#64748B', fontSize: '0.8rem' }}>
                                            {new Date(item.publishDate || item.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(item)}
                                                    style={{
                                                        padding: '0.35rem 0.65rem',
                                                        borderRadius: '6px',
                                                        border: '1px solid #CBD5E1',
                                                        background: '#FFFFFF',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                {isChurchAdmin && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item._id, item.title)}
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

            {/* Modal for create/edit */}
            {modalOpen && (
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
                        maxWidth: '600px',
                        width: '100%',
                        padding: '2rem',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <h3 style={{ fontFamily: 'Cinzel, serif', color: '#1B2A4E', marginBottom: '1.25rem' }}>
                            {isEditing ? 'Edit Announcement' : 'Post New Notice'}
                        </h3>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Notice title..."
                                    required
                                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                                    Content *
                                </label>
                                <textarea
                                    rows="4"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Announcement details, date, instructions..."
                                    required
                                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                                ></textarea>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                                        Category
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                                    >
                                        {CATEGORIES.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                                        Priority
                                    </label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High (Urgent)</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                                    >
                                        <option value="published">Published</option>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="draft">Draft</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                                        Publish Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.publishDate}
                                        onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                                        style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                                    Poster / Banner Image URL (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="https://... or image link"
                                    value={formData.posterUrl}
                                    onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    style={{ padding: '0.65rem 1.25rem', background: '#F1F5F9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    style={{
                                        padding: '0.65rem 1.5rem',
                                        background: '#1B2A4E',
                                        color: '#FAF6F0',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {saving ? 'Saving...' : (isEditing ? 'Update Notice' : 'Publish Notice')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </PortalLayout>
    );
};

export default AnnouncementManagement;

