import React, { useState, useEffect } from 'react';
import PortalLayout from '../../components/PortalLayout';
import ChurchIdCard from '../../components/ChurchIdCard';
import { useAuth } from '../../context/AuthContext';
import { getMember, getAttendanceRecords } from '../../services/api';

const MyIdCard = () => {
    const { user } = useAuth();
    const [member, setMember] = useState(user?.member || null);
    const [myAttendance, setMyAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMemberProfile = async () => {
            try {
                setLoading(true);
                if (user?.churchId) {
                    const res = await getMember(user.churchId);
                    if (res.success && res.member) {
                        setMember(res.member);
                    }
                }
                const attRes = await getAttendanceRecords({ limit: 20 });
                if (attRes.success) {
                    setMyAttendance(attRes.records || []);
                }
            } catch (err) {
                console.error('Error fetching member profile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMemberProfile();
    }, [user]);

    return (
        <PortalLayout title="My Digital Church ID Card">
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(360px, 450px) 1fr',
                gap: '2.5rem',
                alignItems: 'start'
            }}>
                {/* ID Card Display */}
                <div>
                    {loading ? (
                        <p style={{ textAlign: 'center', padding: '2rem' }}>Loading digital card...</p>
                    ) : member ? (
                        <ChurchIdCard member={member} />
                    ) : (
                        <div style={{
                            background: '#FFFFFF',
                            borderRadius: '16px',
                            padding: '2rem',
                            textAlign: 'center',
                            border: '1px solid #E2E8F0'
                        }}>
                            <p>No associated member profile found for {user?.churchId}.</p>
                        </div>
                    )}
                </div>

                {/* Member Profile Details & Attendance History */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        padding: '1.75rem',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.04)'
                    }}>
                        <h3 style={{ fontFamily: 'Cinzel, serif', color: '#1B2A4E', marginBottom: '1rem' }}>
                            Membership Profile
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.88rem' }}>
                            <div>
                                <span style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>Church ID</span>
                                <div style={{ fontFamily: 'monospace', fontWeight: '700', color: '#1B2A4E', fontSize: '1rem' }}>
                                    {member?.churchId || user?.churchId}
                                </div>
                            </div>

                            <div>
                                <span style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>Role in Church</span>
                                <div style={{ fontWeight: '600', color: '#D4AF37' }}>
                                    {user?.role}
                                </div>
                            </div>

                            <div>
                                <span style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>Phone Number</span>
                                <div style={{ fontWeight: '500' }}>
                                    {member?.phone || 'Not listed'}
                                </div>
                            </div>

                            <div>
                                <span style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>Department</span>
                                <div style={{ fontWeight: '500' }}>
                                    {member?.department?.name || member?.department || 'General Assembly'}
                                </div>
                            </div>

                            <div>
                                <span style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>Blood Group</span>
                                <div style={{ fontWeight: '500' }}>
                                    {member?.bloodGroup || 'Unknown'}
                                </div>
                            </div>

                            <div>
                                <span style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</span>
                                <div style={{ fontWeight: '700', color: '#10B981' }}>
                                    {member?.membershipStatus || 'Active'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Personal Attendance History */}
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        padding: '1.75rem',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.04)'
                    }}>
                        <h3 style={{ fontFamily: 'Cinzel, serif', color: '#1B2A4E', marginBottom: '1rem' }}>
                            My Recent Attendance History
                        </h3>

                        {myAttendance.length === 0 ? (
                            <p style={{ color: '#64748B', fontSize: '0.88rem' }}>
                                No check-in records found yet. Present your digital ID QR code during worship services to record attendance!
                            </p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#64748B' }}>
                                        <th style={{ padding: '0.65rem 0.85rem' }}>Service</th>
                                        <th style={{ padding: '0.65rem 0.85rem' }}>Date</th>
                                        <th style={{ padding: '0.65rem 0.85rem' }}>Time</th>
                                        <th style={{ padding: '0.65rem 0.85rem' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myAttendance.map(att => (
                                        <tr key={att._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '0.65rem 0.85rem', fontWeight: '600', color: '#1B2A4E' }}>
                                                {att.serviceType}
                                            </td>
                                            <td style={{ padding: '0.65rem 0.85rem', color: '#64748B' }}>
                                                {att.date}
                                            </td>
                                            <td style={{ padding: '0.65rem 0.85rem', color: '#64748B' }}>
                                                {new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td style={{ padding: '0.65rem 0.85rem' }}>
                                                <span style={{
                                                    fontSize: '0.72rem',
                                                    padding: '2px 8px',
                                                    borderRadius: '10px',
                                                    background: '#DEF7EC',
                                                    color: '#03543F',
                                                    fontWeight: '700'
                                                }}>
                                                    {att.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </PortalLayout>
    );
};

export default MyIdCard;
