import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { checkInAttendance } from '../services/api';

const QrAttendanceScanner = ({ onCheckInSuccess, selectedService, selectedDate }) => {
    const [scannerActive, setScannerActive] = useState(false);
    const [manualId, setManualId] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null); // { type: 'success'|'error'|'warning', message: '' }
    const html5QrCodeRef = useRef(null);

    const handleScanResult = useCallback(async (scannedText) => {
        if (loading) return;
        setLoading(true);
        setFeedback(null);

        try {
            // Clean up text if it is a full verification URL
            let id = scannedText.trim();
            if (id.includes('/verify/')) {
                id = id.split('/verify/')[1].split(/[?#&/]/)[0];
            }

            const res = await checkInAttendance({
                churchId: id,
                serviceType: selectedService,
                date: selectedDate,
                checkInMethod: 'QR Scan'
            });

            if (res.success) {
                setFeedback({
                    type: 'success',
                    message: `✅ Checked in: ${res.member.fullName} (${res.member.churchId})`
                });
                if (onCheckInSuccess) onCheckInSuccess(res);
            }
        } catch (err) {
            const isDuplicate = err.message.includes('already checked in') || err.message.includes('Duplicate');
            setFeedback({
                type: isDuplicate ? 'warning' : 'error',
                message: isDuplicate ? `⚠️ Already Checked In: ${err.message}` : `❌ ${err.message}`
            });
        } finally {
            setLoading(false);
        }
    }, [loading, selectedService, selectedDate, onCheckInSuccess]);

    const startScanner = async () => {
        try {
            setFeedback(null);
            const qrCode = new Html5Qrcode("qr-attendance-reader");
            html5QrCodeRef.current = qrCode;

            await qrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText) => {
                    handleScanResult(decodedText);
                },
                (errorMessage) => {
                    // scanning frame failure - ignorable
                }
            );
            setScannerActive(true);
        } catch (err) {
            console.error("Camera scanner error:", err);
            setFeedback({
                type: 'error',
                message: 'Unable to access camera. Please allow camera permissions or use manual Church ID entry below.'
            });
            setScannerActive(false);
        }
    };

    const stopScanner = async () => {
        if (html5QrCodeRef.current && scannerActive) {
            try {
                await html5QrCodeRef.current.stop();
                await html5QrCodeRef.current.clear();
            } catch (err) {
                console.error("Error stopping scanner:", err);
            }
            setScannerActive(false);
        }
    };

    useEffect(() => {
        return () => {
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                html5QrCodeRef.current.stop().catch(() => {});
            }
        };
    }, []);

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (!manualId.trim()) return;
        handleScanResult(manualId);
        setManualId('');
    };

    return (
        <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            border: '1px solid #E2E8F0',
            maxWidth: '520px',
            margin: '0 auto'
        }}>
            <h3 style={{
                fontFamily: 'Cinzel, serif',
                color: '#1B2A4E',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                📷 Live QR Attendance Scanner
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
                Position member ID card QR code in front of camera or enter Church ID manually.
            </p>

            {/* Camera Viewfinder */}
            <div
                id="qr-attendance-reader"
                style={{
                    width: '100%',
                    minHeight: scannerActive ? '300px' : '0px',
                    backgroundColor: scannerActive ? '#000' : 'transparent',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    marginBottom: '1rem'
                }}
            ></div>

            {/* Scanner Controls */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {!scannerActive ? (
                    <button
                        type="button"
                        onClick={startScanner}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            backgroundColor: '#1B2A4E',
                            color: '#FAF6F0',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        📹 Start Camera Scanner
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={stopScanner}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            backgroundColor: '#DC2626',
                            color: '#FAF6F0',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        ⏹️ Stop Camera
                    </button>
                )}
            </div>

            {/* Feedback Alert Box */}
            {feedback && (
                <div style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    marginBottom: '1.25rem',
                    fontSize: '0.88rem',
                    fontWeight: '500',
                    backgroundColor: feedback.type === 'success' ? '#DEF7EC' : feedback.type === 'warning' ? '#FEF08A' : '#FDE8E8',
                    color: feedback.type === 'success' ? '#03543F' : feedback.type === 'warning' ? '#854D0E' : '#9B1C1C',
                    border: `1px solid ${feedback.type === 'success' ? '#31C48D' : feedback.type === 'warning' ? '#EAB308' : '#F98080'}`
                }}>
                    {feedback.message}
                </div>
            )}

            {/* Manual Church ID / Barcode Search check-in */}
            <form onSubmit={handleManualSubmit} style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#1B2A4E', marginBottom: '0.4rem' }}>
                    Quick Church ID Check-in
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        placeholder="e.g. BSC-2026-0001"
                        value={manualId}
                        onChange={(e) => setManualId(e.target.value.toUpperCase())}
                        style={{
                            flex: 1,
                            padding: '0.65rem 0.85rem',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            fontFamily: 'monospace',
                            fontSize: '0.95rem'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={loading || !manualId.trim()}
                        style={{
                            padding: '0.65rem 1.2rem',
                            backgroundColor: '#D4AF37',
                            color: '#1B2A4E',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '700',
                            cursor: 'pointer'
                        }}
                    >
                        {loading ? 'Checking...' : 'Check In'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QrAttendanceScanner;

