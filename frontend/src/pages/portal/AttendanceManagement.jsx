import React, { useState, useEffect, useCallback } from 'react';
import PortalLayout from '../../components/PortalLayout';
import QrAttendanceScanner from '../../components/QrAttendanceScanner';
import {
    getAttendanceRecords,
    getAttendanceSummary,
    exportAttendanceCsvUrl,
    deleteAttendanceRecord,
    getDepartments
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './AttendanceManagement.css';

const SERVICE_TYPES = [
    'Sunday Worship',
    'Prayer Meeting',
    'Bible Study',
    'Youth Meeting',
    'Department Meeting',
    'Special Program'
];

const AttendanceManagement = () => {
    const { isChurchAdmin } = useAuth();
    const todayStr = new Date().toISOString().split('T')[0];

    const [selectedService, setSelectedService] = useState('Sunday Worship');
    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [records, setRecords] = useState([]);
    const [summary, setSummary] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState('');
    const [loading, setLoading] = useState(true);

    const loadAttendance = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                date: selectedDate,
                serviceType: selectedService
            };
            if (selectedDept) params.department = selectedDept;

            const [recRes, sumRes, deptRes] = await Promise.all([
                getAttendanceRecords(params),
                getAttendanceSummary(),
                getDepartments()
            ]);

            if (recRes.success) setRecords(recRes.records || []);
            if (sumRes.success) setSummary(sumRes.summary);
            if (deptRes.departments) setDepartments(deptRes.departments);
        } catch (err) {
            console.error('Failed to load attendance:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedDate, selectedService, selectedDept]);

    useEffect(() => {
        loadAttendance();
    }, [loadAttendance]);

    const handleCheckInSuccess = () => {
        loadAttendance();
    };

    const handleDeleteRecord = async (id, memberName) => {
        if (!window.confirm(`Delete check-in record for ${memberName}?`)) return;
        try {
            await deleteAttendanceRecord(id);
            loadAttendance();
        } catch (err) {
            alert(err.message || 'Error deleting record.');
        }
    };

    const handleExport = () => {
        const url = exportAttendanceCsvUrl({
            date: selectedDate,
            serviceType: selectedService,
            department: selectedDept
        });
        window.open(url, '_blank');
    };

    return (
        <PortalLayout title="Attendance & Check-in Management">
            <div className="attendance-layout">
                {/* Service Selector & Filters Bar */}
                <div className="attendance-service-bar">
                    <div className="service-selector-group">
                        <div className="service-select-item">
                            <label>Service / Meeting</label>
                            <select
                                value={selectedService}
                                onChange={(e) => setSelectedService(e.target.value)}
                            >
                                {SERVICE_TYPES.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <div className="service-select-item">
                            <label>Service Date</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>

                        <div className="service-select-item">
                            <label>Department Filter</label>
                            <select
                                value={selectedDept}
                                onChange={(e) => setSelectedDept(e.target.value)}
                            >
                                <option value="">All Church Departments</option>
                                {departments.map(d => (
                                    <option key={d._id} value={d._id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button type="button" onClick={handleExport} className="btn-export">
                        📥 Export Attendance CSV
                    </button>
                </div>

                {/* Summary Metrics Strip */}
                {summary && (
                    <div className="attendance-report-cards">
                        <div className="report-stat-card">
                            <h4>Current Service Check-ins</h4>
                            <div className="val">{records.length}</div>
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>On {selectedDate}</span>
                        </div>
                        <div className="report-stat-card">
                            <h4>Active Congregation</h4>
                            <div className="val">{summary.totalActiveMembers}</div>
                            <span style={{ fontSize: '0.75rem', color: '#10B981' }}>Total Registered</span>
                        </div>
                        <div className="report-stat-card">
                            <h4>Attendance Ratio</h4>
                            <div className="val" style={{ color: '#D4AF37' }}>
                                {summary.totalActiveMembers > 0
                                    ? Math.round((records.length / summary.totalActiveMembers) * 100)
                                    : 0}%
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Turnout percentage</span>
                        </div>
                    </div>
                )}

                {/* Main 2-column layout: Scanner on Left, Records List on Right */}
                <div className="attendance-two-col">
                    {/* Scanner Card */}
                    <div>
                        <QrAttendanceScanner
                            onCheckInSuccess={handleCheckInSuccess}
                            selectedService={selectedService}
                            selectedDate={selectedDate}
                        />
                    </div>

                    {/* Attendance Records Table */}
                    <div className="attendance-logs-card">
                        <div className="attendance-logs-header">
                            <h3 className="attendance-logs-title">
                                Check-in Log ({records.length})
                            </h3>
                            <button
                                type="button"
                                onClick={loadAttendance}
                                style={{
                                    background: 'none',
                                    border: '1px solid #CBD5E1',
                                    padding: '0.35rem 0.75rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem'
                                }}
                            >
                                🔄 Refresh
                            </button>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                                Updating check-in log...
                            </div>
                        ) : records.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                                <span style={{ fontSize: '2.5rem' }}>📋</span>
                                <p style={{ marginTop: '0.5rem' }}>
                                    No members checked in yet for <strong>{selectedService}</strong> on <strong>{selectedDate}</strong>.
                                    <br />
                                    Scan member QR cards or use quick ID search to record attendance.
                                </p>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#64748B' }}>
                                        <th style={{ padding: '0.75rem 1rem' }}>ID</th>
                                        <th style={{ padding: '0.75rem 1rem' }}>Member</th>
                                        <th style={{ padding: '0.75rem 1rem' }}>Time</th>
                                        <th style={{ padding: '0.75rem 1rem' }}>Method</th>
                                        <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                                        {isChurchAdmin && <th style={{ padding: '0.75rem 1rem' }}>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map(rec => (
                                        <tr key={rec._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <code style={{ color: '#1B2A4E', fontWeight: '700' }}>{rec.churchId}</code>
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#1B2A4E' }}>
                                                {rec.memberName}
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', color: '#64748B' }}>
                                                {new Date(rec.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <span style={{
                                                    fontSize: '0.72rem',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    background: rec.checkInMethod === 'QR Scan' ? '#E0E7FF' : '#F1F5F9',
                                                    color: rec.checkInMethod === 'QR Scan' ? '#3730A3' : '#475569'
                                                }}>
                                                    {rec.checkInMethod}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <span style={{
                                                    fontSize: '0.72rem',
                                                    fontWeight: '700',
                                                    color: '#03543F',
                                                    background: '#DEF7EC',
                                                    padding: '2px 8px',
                                                    borderRadius: '10px'
                                                }}>
                                                    {rec.status}
                                                </span>
                                            </td>
                                            {isChurchAdmin && (
                                                <td style={{ padding: '0.75rem 1rem' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteRecord(rec._id, rec.memberName)}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            color: '#EF4444',
                                                            fontSize: '0.9rem'
                                                        }}
                                                        title="Remove check-in"
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            )}
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

export default AttendanceManagement;

