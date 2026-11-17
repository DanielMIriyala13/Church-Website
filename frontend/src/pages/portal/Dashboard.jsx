import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PortalLayout from '../../components/PortalLayout';
import { getDashboardStats } from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const res = await getDashboardStats();
                if (res.success && res.data) {
                    setStats(res.data);
                }
            } catch (err) {
                console.error('Failed to load dashboard metrics:', err);
                setError(err.message || 'Error loading dashboard metrics.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const metrics = stats?.metrics || {
        totalMembers: 0,
        activeChurchIds: 0,
        departmentCount: 0,
        todayAttendance: 0,
        attendancePercentage: 0,
        pendingPrayers: 0,
        upcomingEventsCount: 0,
        activeAnnouncementsCount: 0
    };

    const maxTrend = stats?.charts?.attendanceTrend?.reduce((max, item) => Math.max(max, item.count), 1) || 10;

    return (
        <PortalLayout title="Church Overview & Analytics">
            <div className="dashboard-grid">
                {/* Quick Actions Bar */}
                <div className="quick-actions-bar">
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
                        Quick Actions:
                    </span>
                    <Link to="/portal/attendance" className="action-pill">
                        <span>📷</span> QR Check-in
                    </Link>
                    <Link to="/portal/members" className="action-pill">
                        <span>➕</span> Register Member
                    </Link>
                    <Link to="/portal/announcements" className="action-pill">
                        <span>📢</span> Post Notice
                    </Link>
                    <Link to="/portal/departments" className="action-pill">
                        <span>🏛️</span> Departments
                    </Link>
                    <Link to="/portal/prayers" className="action-pill">
                        <span>🙏</span> Review Prayers
                    </Link>
                </div>

                {error && (
                    <div style={{
                        padding: '1rem',
                        backgroundColor: '#FDE8E8',
                        color: '#9B1C1C',
                        borderRadius: '12px',
                        border: '1px solid #F98080'
                    }}>
                        {error}
                    </div>
                )}

                {/* Stat Metrics Row */}
                <div className="metrics-row">
                    <div className="metric-card">
                        <div className="metric-icon-box" style={{ background: '#E0E7FF', color: '#3730A3' }}>
                            👥
                        </div>
                        <div className="metric-details">
                            <div className="metric-val">{metrics.totalMembers}</div>
                            <div className="metric-label">Total Members</div>
                            <div className="metric-sub">{metrics.activeChurchIds} Active Church IDs</div>
                        </div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-icon-box" style={{ background: '#FEF3C7', color: '#92400E' }}>
                            🪪
                        </div>
                        <div className="metric-details">
                            <div className="metric-val">{metrics.activeChurchIds}</div>
                            <div className="metric-label">Active Church IDs</div>
                            <div className="metric-sub">100% Unique BSC Records</div>
                        </div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-icon-box" style={{ background: '#DEF7EC', color: '#03543F' }}>
                            📅
                        </div>
                        <div className="metric-details">
                            <div className="metric-val">{metrics.todayAttendance}</div>
                            <div className="metric-label">Today's Check-ins</div>
                            <div className="metric-sub">{metrics.attendancePercentage}% Active Attendance</div>
                        </div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-icon-box" style={{ background: '#FCE7F3', color: '#9D174D' }}>
                            🏛️
                        </div>
                        <div className="metric-details">
                            <div className="metric-val">{metrics.departmentCount}</div>
                            <div className="metric-label">Departments</div>
                            <div className="metric-sub">Active Ministries</div>
                        </div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-icon-box" style={{ background: '#FEE2E2', color: '#991B1B' }}>
                            🙏
                        </div>
                        <div className="metric-details">
                            <div className="metric-val">{metrics.pendingPrayers}</div>
                            <div className="metric-label">Pending Prayers</div>
                            <div className="metric-sub">{stats?.metrics?.totalPrayers || 0} Total Requests</div>
                        </div>
                    </div>
                </div>

                {/* Analytics Row */}
                <div className="analytics-row">
                    {/* Attendance Trend Chart */}
                    <div className="chart-card">
                        <div className="chart-card-header">
                            <h3 className="chart-card-title">Recent Attendance Activity</h3>
                            <Link to="/portal/attendance" style={{ fontSize: '0.82rem', color: '#D4AF37', textDecoration: 'none', fontWeight: '600' }}>
                                View Full Log →
                            </Link>
                        </div>

                        {loading ? (
                            <p style={{ color: '#64748B' }}>Loading attendance analytics...</p>
                        ) : stats?.charts?.attendanceTrend?.length > 0 ? (
                            <div className="attendance-trend-bars">
                                {stats.charts.attendanceTrend.map((item, idx) => {
                                    const heightPct = Math.max(15, Math.round((item.count / maxTrend) * 100));
                                    return (
                                        <div key={idx} className="trend-bar-col">
                                            <div className="trend-bar-fill" style={{ height: `${heightPct}%` }}>
                                                <span className="trend-bar-tooltip">{item.count}</span>
                                            </div>
                                            <span className="trend-bar-date">{item._id.substring(5)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
                                No check-in records for recent dates. Start today's attendance check-in above!
                            </div>
                        )}
                    </div>

                    {/* Department Distribution */}
                    <div className="chart-card">
                        <div className="chart-card-header">
                            <h3 className="chart-card-title">Department Distribution</h3>
                            <Link to="/portal/departments" style={{ fontSize: '0.82rem', color: '#D4AF37', textDecoration: 'none', fontWeight: '600' }}>
                                All ({metrics.departmentCount}) →
                            </Link>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            {stats?.charts?.departmentDistribution?.length > 0 ? (
                                stats.charts.departmentDistribution.map((dept, i) => (
                                    <div key={i}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '3px' }}>
                                            <span style={{ fontWeight: '600', color: '#1B2A4E' }}>{dept.name}</span>
                                            <span style={{ color: '#64748B' }}>{dept.count} members</span>
                                        </div>
                                        <div style={{ height: '7px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${Math.min(100, Math.round((dept.count / Math.max(metrics.totalMembers, 1)) * 100))}%`,
                                                background: '#D4AF37',
                                                borderRadius: '4px'
                                            }}></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#64748B', fontSize: '0.85rem' }}>Assign members to departments to view ministry distribution.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Items Row */}
                <div className="recent-row">
                    {/* Recent Announcements */}
                    <div className="chart-card">
                        <div className="chart-card-header">
                            <h3 className="chart-card-title">Recent Church Notices</h3>
                            <Link to="/portal/announcements" style={{ fontSize: '0.82rem', color: '#D4AF37', textDecoration: 'none', fontWeight: '600' }}>
                                Manage →
                            </Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {stats?.recent?.announcements?.length > 0 ? (
                                stats.recent.announcements.map(ann => (
                                    <div key={ann._id} style={{
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        background: '#F8FAFC',
                                        border: '1px solid #E2E8F0'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                            <strong style={{ fontSize: '0.9rem', color: '#1B2A4E' }}>{ann.title}</strong>
                                            <span style={{
                                                fontSize: '0.68rem',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                background: ann.priority === 'high' ? '#FEE2E2' : '#FEF3C7',
                                                color: ann.priority === 'high' ? '#991B1B' : '#92400E',
                                                fontWeight: '600'
                                            }}>
                                                {ann.category}
                                            </span>
                                        </div>
                                        <p style={{
                                            fontSize: '0.8rem',
                                            color: '#64748B',
                                            margin: 0,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {ann.content}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#64748B', fontSize: '0.85rem' }}>No announcements published yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Audit Activities */}
                    <div className="chart-card">
                        <div className="chart-card-header">
                            <h3 className="chart-card-title">Audit Activity Feed</h3>
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Live Logs</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '250px', overflowY: 'auto' }}>
                            {stats?.recent?.activities?.length > 0 ? (
                                stats.recent.activities.map(act => (
                                    <div key={act._id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.5rem 0',
                                        borderBottom: '1px solid #F1F5F9',
                                        fontSize: '0.8rem'
                                    }}>
                                        <div>
                                            <span style={{ fontWeight: '600', color: '#1B2A4E' }}>{act.action}</span>
                                            <span style={{ color: '#64748B', marginLeft: '0.5rem' }}>by {act.performedBy}</span>
                                        </div>
                                        <span style={{ color: '#94A3B8', fontSize: '0.72rem' }}>
                                            {new Date(act.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#64748B', fontSize: '0.85rem' }}>Activity log will record operations as actions are taken.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PortalLayout>
    );
};

export default Dashboard;
