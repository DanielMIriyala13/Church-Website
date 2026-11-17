import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyChurchId } from '../services/api';

const VerifyChurchId = () => {
    const { churchId } = useParams();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const doVerify = async () => {
            try {
                setLoading(true);
                const res = await verifyChurchId(churchId);
                if (res.success && res.verified) {
                    setResult(res);
                } else {
                    setError(res.message || 'Unable to verify Church ID.');
                }
            } catch (err) {
                setError(err.message || 'Verification failed. ID may be invalid.');
            } finally {
                setLoading(false);
            }
        };

        if (churchId) {
            doVerify();
        }
    }, [churchId]);

    return (
        <div style={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1rem',
            background: 'linear-gradient(135deg, #FAF6F0 0%, #F1F5F9 100%)'
        }}>
            <div style={{
                maxWidth: '480px',
                width: '100%',
                background: '#FFFFFF',
                borderRadius: '24px',
                padding: '2.5rem 2rem',
                boxShadow: '0 20px 50px rgba(27, 42, 78, 0.12)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                textAlign: 'center'
            }}>
                {loading ? (
                    <div>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            border: '4px solid #E2E8F0',
                            borderTop: '4px solid #D4AF37',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 1.5rem'
                        }}></div>
                        <h3 style={{ fontFamily: 'Cinzel, serif', color: '#1B2A4E' }}>Verifying Official Church ID...</h3>
                        <p style={{ color: '#64748B', fontSize: '0.88rem' }}>Authenticating credentials against Bethesda Church registry</p>
                    </div>
                ) : error ? (
                    <div>
                        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>❌</div>
                        <h2 style={{ fontFamily: 'Cinzel, serif', color: '#DC2626', marginBottom: '0.5rem' }}>
                            Verification Failed
                        </h2>
                        <div style={{
                            background: '#FEE2E2',
                            color: '#991B1B',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            marginBottom: '1.5rem'
                        }}>
                            {error}
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem' }}>
                            Church ID: <strong>{churchId}</strong> is not recognized as an active member record.
                        </p>
                        <Link to="/" style={{
                            padding: '0.7rem 1.5rem',
                            background: '#1B2A4E',
                            color: '#FAF6F0',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '600'
                        }}>
                            Return to Website
                        </Link>
                    </div>
                ) : result?.member ? (
                    <div>
                        {/* Verified Seal */}
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: '#DEF7EC',
                            color: '#03543F',
                            padding: '0.4rem 1rem',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            marginBottom: '1.5rem',
                            border: '1px solid #31C48D'
                        }}>
                            <span>🛡️</span> OFFICIAL VERIFIED MEMBER
                        </div>

                        <div style={{
                            width: '110px',
                            height: '110px',
                            borderRadius: '50%',
                            border: '4px solid #D4AF37',
                            margin: '0 auto 1rem',
                            overflow: 'hidden',
                            background: '#FAF6F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                        }}>
                            {result.member.photo ? (
                                <img src={result.member.photo} alt={result.member.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: '2.8rem' }}>👤</span>
                            )}
                        </div>

                        <h2 style={{
                            fontFamily: 'Cinzel, serif',
                            fontSize: '1.4rem',
                            color: '#1B2A4E',
                            marginBottom: '0.25rem'
                        }}>
                            {result.member.fullName}
                        </h2>

                        <div style={{
                            display: 'inline-block',
                            background: '#1B2A4E',
                            color: '#D4AF37',
                            padding: '0.25rem 0.85rem',
                            borderRadius: '16px',
                            fontFamily: 'monospace',
                            fontSize: '0.95rem',
                            fontWeight: '700',
                            letterSpacing: '1px',
                            marginBottom: '1.5rem',
                            border: '1px solid #D4AF37'
                        }}>
                            {result.member.churchId}
                        </div>

                        <div style={{
                            background: '#F8FAFC',
                            borderRadius: '12px',
                            padding: '1rem',
                            border: '1px solid #E2E8F0',
                            textAlign: 'left',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #EDF2F7', fontSize: '0.85rem' }}>
                                <span style={{ color: '#64748B' }}>Department</span>
                                <strong style={{ color: '#1B2A4E' }}>{result.member.department}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #EDF2F7', fontSize: '0.85rem' }}>
                                <span style={{ color: '#64748B' }}>Membership Status</span>
                                <strong style={{ color: result.member.membershipStatus === 'Active' ? '#16A34A' : '#DC2626' }}>
                                    {result.member.membershipStatus}
                                </strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #EDF2F7', fontSize: '0.85rem' }}>
                                <span style={{ color: '#64748B' }}>Blood Group</span>
                                <strong style={{ color: '#1B2A4E' }}>{result.member.bloodGroup || 'Unknown'}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.85rem' }}>
                                <span style={{ color: '#64748B' }}>Affiliation</span>
                                <strong style={{ color: '#1B2A4E' }}>LEF Bethesda Church</strong>
                            </div>
                        </div>

                        <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginBottom: '1.5rem' }}>
                            Digitally verified on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                        </div>

                        <Link to="/" style={{
                            display: 'inline-block',
                            padding: '0.7rem 1.5rem',
                            background: '#1B2A4E',
                            color: '#FAF6F0',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            fontSize: '0.9rem'
                        }}>
                            Visit Public Church Website
                        </Link>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default VerifyChurchId;
