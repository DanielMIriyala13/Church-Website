import React, { useState, useEffect, useCallback } from 'react';
import PortalLayout from '../../components/PortalLayout';
import {
    getDepartments,
    getDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getMembers,
    assignDepartmentMember
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './DepartmentManagement.css';

const DepartmentManagement = () => {
    const { isChurchAdmin } = useAuth();
    const [departments, setDepartments] = useState([]);
    const [allMembers, setAllMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedDeptDetail, setSelectedDeptDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        meetingSchedule: 'Every Sunday after main service',
        color: '#D4AF37',
        icon: 'users',
        head: ''
    });
    const [formMsg, setFormMsg] = useState({ type: '', text: '' });
    const [assignMemberId, setAssignMemberId] = useState('');

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [dRes, mRes] = await Promise.all([
                getDepartments(),
                getMembers({ limit: 200 })
            ]);
            if (dRes.departments) setDepartments(dRes.departments);
            if (mRes.members) setAllMembers(mRes.members);
        } catch (err) {
            console.error('Failed to load departments:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const openCreateModal = () => {
        setIsEditing(false);
        setFormMsg({ type: '', text: '' });
        setFormData({
            name: '',
            code: '',
            description: '',
            meetingSchedule: 'Every Sunday after main service',
            color: '#D4AF37',
            icon: 'users',
            head: ''
        });
        setShowModal(true);
    };

    const openEditModal = (dept) => {
        setIsEditing(true);
        setFormMsg({ type: '', text: '' });
        setFormData({
            _id: dept._id,
            name: dept.name,
            code: dept.code,
            description: dept.description || '',
            meetingSchedule: dept.meetingSchedule || '',
            color: dept.color || '#D4AF37',
            icon: dept.icon || 'users',
            head: dept.head?._id || dept.head || ''
        });
        setShowModal(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormMsg({ type: '', text: '' });

        try {
            if (isEditing) {
                await updateDepartment(formData._id, formData);
                setFormMsg({ type: 'success', text: 'Department updated successfully!' });
            } else {
                await createDepartment(formData);
                setFormMsg({ type: 'success', text: 'Department created successfully!' });
            }
            setTimeout(() => {
                setShowModal(false);
                loadData();
            }, 1000);
        } catch (err) {
            setFormMsg({ type: 'error', text: err.message || 'Operation failed.' });
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete department "${name}"? Members will be moved to General Assembly.`)) return;
        try {
            await deleteDepartment(id);
            loadData();
        } catch (err) {
            alert(err.message || 'Failed to delete department.');
        }
    };

    const viewDepartmentDetails = async (deptId) => {
        try {
            setDetailLoading(true);
            setShowDetailModal(true);
            const res = await getDepartment(deptId);
            if (res.success && res.department) {
                setSelectedDeptDetail(res.department);
            }
        } catch (err) {
            console.error('Error fetching department details:', err);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleAssignMember = async (e) => {
        e.preventDefault();
        if (!assignMemberId || !selectedDeptDetail) return;
        try {
            await assignDepartmentMember(selectedDeptDetail._id, { memberId: assignMemberId });
            viewDepartmentDetails(selectedDeptDetail._id);
            setAssignMemberId('');
            loadData();
        } catch (err) {
            alert(err.message || 'Failed to assign member.');
        }
    };

    return (
        <PortalLayout title="Department Management">
            <div className="dept-container">
                <div className="dept-header-bar">
                    <div>
                        <h2 style={{ fontFamily: 'Cinzel, serif', color: '#1B2A4E', margin: 0, fontSize: '1.4rem' }}>
                            Church Ministries & Departments
                        </h2>
                        <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '4px 0 0' }}>
                            Organize church activities, allocate members, and review ministry health.
                        </p>
                    </div>

                    {isChurchAdmin && (
                        <button className="btn-primary-action" onClick={openCreateModal}>
                            <span>➕</span> Create Department
                        </button>
                    )}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <p>Loading departments...</p>
                    </div>
                ) : (
                    <div className="dept-grid">
                        {departments.map(dept => (
                            <div key={dept._id} className="dept-card">
                                <div className="dept-card-top">
                                    <div className="dept-icon-circle" style={{ background: dept.color || '#1B2A4E' }}>
                                        {dept.icon === 'music' ? '🎵' :
                                         dept.icon === 'zap' ? '⚡' :
                                         dept.icon === 'book-open' ? '📖' :
                                         dept.icon === 'heart' ? '❤️' :
                                         dept.icon === 'sun' ? '☀️' :
                                         dept.icon === 'video' ? '📹' : '👥'}
                                    </div>
                                    <div className="dept-card-info">
                                        <h3 className="dept-title">{dept.name}</h3>
                                        <span className="dept-code-tag">{dept.code}</span>
                                    </div>
                                </div>

                                <div className="dept-card-body">
                                    <p className="dept-desc">
                                        {dept.description || 'Dedicated church fellowship ministry and service group.'}
                                    </p>

                                    <div className="dept-meta-item">
                                        <span>⏰</span>
                                        <span>{dept.meetingSchedule || 'Sundays'}</span>
                                    </div>

                                    {dept.head && (
                                        <div className="dept-meta-item">
                                            <span>👑</span>
                                            <span>Head: <strong>{dept.head.fullName}</strong></span>
                                        </div>
                                    )}
                                </div>

                                <div className="dept-card-footer">
                                    <span className="dept-member-pill">
                                        👥 {dept.memberCount || 0} Members
                                    </span>

                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        <button
                                            type="button"
                                            className="action-btn"
                                            style={{ color: '#1B2A4E', fontWeight: '600' }}
                                            onClick={() => viewDepartmentDetails(dept._id)}
                                        >
                                            View Dept →
                                        </button>
                                        {isChurchAdmin && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="action-btn"
                                                    onClick={() => openEditModal(dept)}
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    type="button"
                                                    className="action-btn"
                                                    style={{ color: '#DC2626' }}
                                                    onClick={() => handleDelete(dept._id, dept.name)}
                                                >
                                                    🗑️
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{isEditing ? 'Edit Department' : 'Create Department'}</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                        </div>

                        {formMsg.text && (
                            <div style={{
                                padding: '0.75rem',
                                borderRadius: '8px',
                                marginBottom: '1rem',
                                fontSize: '0.85rem',
                                background: formMsg.type === 'success' ? '#DEF7EC' : '#FDE8E8',
                                color: formMsg.type === 'success' ? '#03543F' : '#9B1C1C'
                            }}>
                                {formMsg.text}
                            </div>
                        )}

                        <form onSubmit={handleFormSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div className="form-group">
                                    <label>Department Name *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Youth Fellowship"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Dept Code *</label>
                                    <input
                                        type="text"
                                        placeholder="YOUTH"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        style={{ fontFamily: 'monospace' }}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    rows="3"
                                    placeholder="Purpose and vision of this ministry..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div className="form-group">
                                    <label>Meeting Schedule</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Every Saturday 6:00 PM"
                                        value={formData.meetingSchedule}
                                        onChange={(e) => setFormData({ ...formData, meetingSchedule: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Department Head</label>
                                    <select
                                        value={formData.head}
                                        onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                                    >
                                        <option value="">No head assigned</option>
                                        {allMembers.map(m => (
                                            <option key={m._id} value={m._id}>{m.fullName} ({m.churchId})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                                <div className="form-group">
                                    <label>Theme Color</label>
                                    <input
                                        type="color"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        style={{ height: '42px', padding: '4px' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Icon Style</label>
                                    <select
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    >
                                        <option value="users">👥 People / Assembly</option>
                                        <option value="music">🎵 Music / Choir</option>
                                        <option value="zap">⚡ Youth / Fire</option>
                                        <option value="book-open">📖 Sunday School / Word</option>
                                        <option value="heart">❤️ Prayer / Intercession</option>
                                        <option value="sun">☀️ Women Fellowship</option>
                                        <option value="video">📹 Media & Tech</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button type="button" className="action-btn" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary-action">
                                    {isEditing ? 'Save Changes' : 'Create Department'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Department Detail View Modal */}
            {showDetailModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h3>{selectedDeptDetail?.name || 'Department Details'}</h3>
                            <button className="close-btn" onClick={() => setShowDetailModal(false)}>×</button>
                        </div>

                        {detailLoading || !selectedDeptDetail ? (
                            <p style={{ textAlign: 'center', padding: '2rem' }}>Loading ministry profile...</p>
                        ) : (
                            <div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: '#F8FAFC',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    marginBottom: '1.25rem'
                                }}>
                                    <div>
                                        <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>Schedule</span>
                                        <div style={{ fontWeight: '600', color: '#1B2A4E' }}>{selectedDeptDetail.meetingSchedule}</div>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>Department Head</span>
                                        <div style={{ fontWeight: '600', color: '#1B2A4E' }}>
                                            {selectedDeptDetail.head ? selectedDeptDetail.head.fullName : 'None appointed'}
                                        </div>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>Enrolled</span>
                                        <div style={{ fontWeight: '700', color: '#D4AF37', fontSize: '1.2rem' }}>
                                            {selectedDeptDetail.memberCount} Members
                                        </div>
                                    </div>
                                </div>

                                {/* Assign Member Section */}
                                {isChurchAdmin && (
                                    <form onSubmit={handleAssignMember} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                        <select
                                            style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                                            value={assignMemberId}
                                            onChange={(e) => setAssignMemberId(e.target.value)}
                                        >
                                            <option value="">Select church member to add to this department...</option>
                                            {allMembers.map(m => (
                                                <option key={m._id} value={m._id}>{m.fullName} ({m.churchId})</option>
                                            ))}
                                        </select>
                                        <button type="submit" className="btn-primary-action" disabled={!assignMemberId}>
                                            Assign
                                        </button>
                                    </form>
                                )}

                                {/* Member List */}
                                <h4 style={{ fontFamily: 'Cinzel, serif', color: '#1B2A4E', marginBottom: '0.75rem' }}>
                                    Enrolled Members ({selectedDeptDetail.members?.length || 0})
                                </h4>

                                <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                                    {selectedDeptDetail.members?.length === 0 ? (
                                        <p style={{ padding: '1rem', color: '#64748B', textAlign: 'center' }}>No members in this department yet.</p>
                                    ) : (
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                            <tbody>
                                                {selectedDeptDetail.members.map(m => (
                                                    <tr key={m._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                        <td style={{ padding: '0.6rem 1rem', fontFamily: 'monospace', fontWeight: '700', color: '#1B2A4E' }}>
                                                            {m.churchId}
                                                        </td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '600' }}>
                                                            {m.fullName}
                                                        </td>
                                                        <td style={{ padding: '0.6rem 1rem', color: '#64748B' }}>
                                                            {m.phone}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </PortalLayout>
    );
};

export default DepartmentManagement;
