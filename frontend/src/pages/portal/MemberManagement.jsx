import React, { useState, useEffect } from 'react';
import PortalLayout from '../../components/PortalLayout';
import ChurchIdCard from '../../components/ChurchIdCard';
import {
    getMembers,
    createMember,
    updateMember,
    deleteMember,
    getDepartments,
    getNextChurchId
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './MemberManagement.css';

const MemberManagement = () => {
    const { isChurchAdmin } = useAuth();
    const [members, setMembers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    // Modals
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showIdCardModal, setShowIdCardModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        gender: 'Male',
        bloodGroup: 'Unknown',
        department: '',
        membershipStatus: 'Active',
        customChurchId: '',
        photo: '',
        joiningDate: new Date().toISOString().split('T')[0],
        address: { street: '', city: 'Kadapa', state: 'Andhra Pradesh', postalCode: '' },
        createLogin: true,
        initialPassword: 'Member@2026'
    });
    const [formMsg, setFormMsg] = useState({ type: '', text: '' });
    const [saving, setSaving] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;
            if (selectedDept) params.department = selectedDept;
            if (selectedStatus) params.status = selectedStatus;

            const [mRes, dRes] = await Promise.all([
                getMembers(params),
                getDepartments()
            ]);

            if (mRes.success) setMembers(mRes.members || []);
            if (dRes.departments) setDepartments(dRes.departments);
        } catch (err) {
            console.error('Failed to load members:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [search, selectedDept, selectedStatus]);

    const openRegisterModal = async () => {
        setIsEditing(false);
        setFormMsg({ type: '', text: '' });
        try {
            const nextRes = await getNextChurchId();
            if (nextRes.success) {
                setFormData(prev => ({
                    ...prev,
                    customChurchId: nextRes.nextId,
                    fullName: '',
                    phone: '',
                    email: '',
                    gender: 'Male',
                    bloodGroup: 'Unknown',
                    department: departments[0]?._id || '',
                    membershipStatus: 'Active',
                    photo: '',
                    joiningDate: new Date().toISOString().split('T')[0],
                    createLogin: true,
                    initialPassword: 'Member@2026'
                }));
            }
        } catch (e) {
            console.error(e);
        }
        setShowRegisterModal(true);
    };

    const openEditModal = (member) => {
        setIsEditing(true);
        setSelectedMember(member);
        setFormMsg({ type: '', text: '' });
        setFormData({
            fullName: member.fullName,
            phone: member.phone,
            email: member.email || '',
            gender: member.gender || 'Male',
            bloodGroup: member.bloodGroup || 'Unknown',
            department: member.department?._id || member.department || '',
            membershipStatus: member.membershipStatus || 'Active',
            customChurchId: member.churchId,
            photo: member.photo || '',
            joiningDate: member.joiningDate ? new Date(member.joiningDate).toISOString().split('T')[0] : '',
            address: member.address || { street: '', city: 'Kadapa', state: 'Andhra Pradesh', postalCode: '' },
            createLogin: false
        });
        setShowRegisterModal(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormMsg({ type: '', text: '' });

        try {
            if (isEditing) {
                const res = await updateMember(selectedMember._id, formData);
                if (res.success) {
                    setFormMsg({ type: 'success', text: 'Member updated successfully!' });
                    setTimeout(() => {
                        setShowRegisterModal(false);
                        loadData();
                    }, 1000);
                }
            } else {
                const res = await createMember(formData);
                if (res.success) {
                    setFormMsg({ type: 'success', text: `Member registered with Church ID: ${res.member.churchId}` });
                    setTimeout(() => {
                        setShowRegisterModal(false);
                        loadData();
                    }, 1200);
                }
            }
        } catch (err) {
            setFormMsg({ type: 'error', text: err.message || 'Operation failed.' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, name, churchId) => {
        if (!window.confirm(`Are you sure you want to permanently delete member ${name} (${churchId})?`)) return;
        try {
            await deleteMember(id);
            loadData();
        } catch (err) {
            alert(err.message || 'Failed to delete member.');
        }
    };

    const viewIdCard = (member) => {
        setSelectedMember(member);
        setShowIdCardModal(true);
    };

    return (
        <PortalLayout title="Church IDs & Member Management">
            <div className="members-container">
                {/* Search & Action Bar */}
                <div className="members-header-bar">
                    <div className="members-search-box">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="🔍 Search name, Church ID, phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <select
                            className="filter-select"
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                        >
                            <option value="">All Departments</option>
                            {departments.map(d => (
                                <option key={d._id} value={d._id}>{d.name}</option>
                            ))}
                        </select>

                        <select
                            className="filter-select"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Probation">Probation</option>
                        </select>
                    </div>

                    <button className="btn-primary-action" onClick={openRegisterModal}>
                        <span>➕</span> Register New Member
                    </button>
                </div>

                {/* Members Data Table */}
                <div className="members-table-wrapper">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <p>Loading church members...</p>
                        </div>
                    ) : members.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3.5rem', color: '#64748B' }}>
                            <span style={{ fontSize: '2.5rem' }}>👥</span>
                            <h3 style={{ fontFamily: 'Cinzel, serif', color: '#1B2A4E', margin: '0.75rem 0 0.25rem' }}>
                                No Church Members Found
                            </h3>
                            <p>Register members to automatically issue unique Church IDs and digital ID cards.</p>
                        </div>
                    ) : (
                        <table className="members-table">
                            <thead>
                                <tr>
                                    <th>Church ID</th>
                                    <th>Member Name</th>
                                    <th>Phone</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map(m => (
                                    <tr key={m._id}>
                                        <td>
                                            <span className="church-id-badge">{m.churchId}</span>
                                        </td>
                                        <td>
                                            <div className="member-cell-info">
                                                <div className="member-table-avatar">
                                                    {m.photo ? (
                                                        <img src={m.photo} alt={m.fullName} />
                                                    ) : (
                                                        <span>{m.fullName.substring(0, 1)}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="member-table-name">{m.fullName}</div>
                                                    <div className="member-table-phone">{m.email || 'LEF Kadapa'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{m.phone}</td>
                                        <td>{m.department?.name || 'General'}</td>
                                        <td>
                                            <span className={`status-badge status-${m.membershipStatus || 'Active'}`}>
                                                {m.membershipStatus || 'Active'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <button
                                                    className="action-btn"
                                                    title="View Digital ID Card"
                                                    onClick={() => viewIdCard(m)}
                                                    style={{ color: '#D4AF37', borderColor: '#D4AF37' }}
                                                >
                                                    🪪 ID Card
                                                </button>
                                                <button
                                                    className="action-btn"
                                                    title="Edit Details"
                                                    onClick={() => openEditModal(m)}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                {isChurchAdmin && (
                                                    <button
                                                        className="action-btn"
                                                        title="Delete Member"
                                                        style={{ color: '#DC2626' }}
                                                        onClick={() => handleDelete(m._id, m.fullName, m.churchId)}
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

            {/* Register / Edit Member Modal */}
            {showRegisterModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{isEditing ? 'Edit Church Member' : 'Register Church Member'}</h3>
                            <button className="close-btn" onClick={() => setShowRegisterModal(false)}>×</button>
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
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div className="form-group">
                                    <label>Generated Church ID</label>
                                    <input
                                        type="text"
                                        value={formData.customChurchId}
                                        onChange={(e) => setFormData({ ...formData, customChurchId: e.target.value.toUpperCase() })}
                                        disabled={isEditing}
                                        style={{ fontFamily: 'monospace', fontWeight: '700', color: '#1B2A4E', background: '#F8FAFC' }}
                                        required
                                    />
                                    {!isEditing && <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Auto-incremented sequence</span>}
                                </div>

                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        placeholder="e.g. John Emmanuel"
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div className="form-group">
                                    <label>Phone Number *</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+91..."
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="email@example.com"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div className="form-group">
                                    <label>Department</label>
                                    <select
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(d => (
                                            <option key={d._id} value={d._id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Gender</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Blood Group</label>
                                    <select
                                        value={formData.bloodGroup}
                                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                                    >
                                        <option value="Unknown">Unknown</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Photo URL (or Upload)</label>
                                <input
                                    type="text"
                                    placeholder="https://... or data:image/..."
                                    value={formData.photo}
                                    onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                                />
                            </div>

                            {!isEditing && (
                                <div style={{
                                    background: '#F8FAFC',
                                    padding: '0.85rem 1rem',
                                    borderRadius: '8px',
                                    border: '1px solid #E2E8F0',
                                    marginBottom: '1.25rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                        <input
                                            type="checkbox"
                                            id="createLoginCheckbox"
                                            checked={formData.createLogin}
                                            onChange={(e) => setFormData({ ...formData, createLogin: e.target.checked })}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        <label htmlFor="createLoginCheckbox" style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1B2A4E', margin: 0 }}>
                                            Enable ID-Based Portal Login for this Member
                                        </label>
                                    </div>
                                    {formData.createLogin && (
                                        <div style={{ fontSize: '0.78rem', color: '#64748B', marginLeft: '1.75rem' }}>
                                            Default initial password: <code>Member@2026</code> (Member can change upon login)
                                        </div>
                                    )}
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button
                                    type="button"
                                    className="action-btn"
                                    onClick={() => setShowRegisterModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary-action"
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : (isEditing ? 'Update Member' : 'Register Member')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Digital ID Card Preview & Download Modal */}
            {showIdCardModal && selectedMember && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '460px', padding: '1.75rem' }}>
                        <div className="modal-header">
                            <h3>Digital Church ID Card</h3>
                            <button className="close-btn" onClick={() => setShowIdCardModal(false)}>×</button>
                        </div>
                        <ChurchIdCard member={selectedMember} />
                    </div>
                </div>
            )}
        </PortalLayout>
    );
};

export default MemberManagement;
