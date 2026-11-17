import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './ChurchIdCard.css';

const ChurchIdCard = ({ member }) => {
    const [flipped, setFlipped] = useState(false);
    const cardRef = useRef();

    if (!member) return null;

    const churchId = member.churchId || 'BSC-2026-0000';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://bethesdaks.org';
    const verifyUrl = `${baseUrl}/verify/${churchId}`;

    const handlePrint = () => {
        window.print();
    };

    const joiningYear = member.joiningDate
        ? new Date(member.joiningDate).getFullYear()
        : 2026;

    const departmentName = member.department?.name || member.department || 'General Assembly';

    return (
        <div className="id-card-wrapper">
            <div className="id-card-controls">
                <button
                    type="button"
                    onClick={() => setFlipped(!flipped)}
                    className="id-card-btn id-card-btn-secondary"
                >
                    🔄 Flip to {flipped ? 'Front' : 'Back'} Side
                </button>
                <button
                    type="button"
                    onClick={handlePrint}
                    className="id-card-btn id-card-btn-primary"
                >
                    🖨️ Print / Download ID Card
                </button>
            </div>

            <div
                ref={cardRef}
                className={`id-card-container id-card-print-target ${flipped ? 'flipped' : ''}`}
            >
                {/* Front Side */}
                <div className="id-card-front">
                    <div className="id-card-header">
                        <span className="id-card-header-badge">MEMBER</span>
                        <div className="id-card-church-name">Bethesda Satyavakyam</div>
                        <div className="id-card-church-sub">LEF Church • Kadapa City</div>
                    </div>

                    <div className="id-card-body">
                        <div className="id-card-photo-box">
                            {member.photo ? (
                                <img src={member.photo} alt={member.fullName} />
                            ) : (
                                <div className="id-card-photo-placeholder">👤</div>
                            )}
                        </div>

                        <div className="id-card-name">{member.fullName}</div>
                        <div className="id-card-id-tag">{churchId}</div>

                        <div className="id-card-grid">
                            <div className="id-card-item">
                                <div className="id-card-item-label">Department</div>
                                <div className="id-card-item-val" title={departmentName}>{departmentName}</div>
                            </div>
                            <div className="id-card-item">
                                <div className="id-card-item-label">Status</div>
                                <div className="id-card-item-val" style={{ color: member.membershipStatus === 'Active' ? '#16A34A' : '#DC2626' }}>
                                    {member.membershipStatus || 'Active'}
                                </div>
                            </div>
                            <div className="id-card-item">
                                <div className="id-card-item-label">Blood Group</div>
                                <div className="id-card-item-val">{member.bloodGroup || 'Unknown'}</div>
                            </div>
                            <div className="id-card-item">
                                <div className="id-card-item-label">Member Since</div>
                                <div className="id-card-item-val">{joiningYear}</div>
                            </div>
                        </div>

                        <div className="id-card-qr-box">
                            <QRCodeSVG
                                value={verifyUrl}
                                size={68}
                                level="M"
                                includeMargin={false}
                                fgColor="#1B2A4E"
                            />
                            <span>Scan to Verify ID</span>
                        </div>
                    </div>

                    <div className="id-card-footer">
                        Official Digital Identification • Valid for Church Attendance
                    </div>
                </div>

                {/* Back Side */}
                <div className="id-card-back">
                    <div className="id-card-header">
                        <div className="id-card-church-name">Bethesda Satyavakyam Church</div>
                        <div className="id-card-church-sub">Believers Fellowship • Kadapa</div>
                    </div>

                    <div className="id-card-back-body">
                        <div className="id-card-scripture">
                            "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee."
                            <br />
                            <strong style={{ fontSize: '0.75rem' }}>— Isaiah 41:10</strong>
                        </div>

                        <ol className="id-card-rules">
                            <li>This card is non-transferable and remains property of BSC.</li>
                            <li>Carry this card for Sunday worship check-in and conferences.</li>
                            <li>Present QR code upon arrival at sanctuary check-in desks.</li>
                            <li>If found, please return to LEF Bethesda Church, Kadapa.</li>
                        </ol>

                        <div style={{ fontSize: '0.7rem', color: '#64748B', textAlign: 'center' }}>
                            Emergency Contact: <strong>{member.emergencyContact?.phone || member.phone || '+91 9440284422'}</strong>
                        </div>

                        <div className="id-card-signature-area">
                            <div className="id-card-seal">
                                Official<br />Seal
                            </div>
                            <div className="id-card-sig-line">
                                <div style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: '0.9rem', color: '#1B2A4E' }}>
                                    Baburao M.
                                </div>
                                <span>Senior Pastor</span>
                            </div>
                        </div>
                    </div>

                    <div className="id-card-footer">
                        LEF Bethesda Church, Kadapa, AP 516001 • Tel: +91 9440284422
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChurchIdCard;
