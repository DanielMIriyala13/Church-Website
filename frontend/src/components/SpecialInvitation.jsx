import React, { useEffect, useRef } from 'react';
import invitationImage from '../assets/Invitation.jpeg';
import './SpecialInvitation.css';

const SpecialInvitation = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    return (
        <section className="special-invitation-section" ref={sectionRef}>
            <div className="invitation-gold-glow"></div>

            <div className="special-invitation-container">
                <div className="invitation-header">
                    <h2 className="invitation-title">Special Invitation</h2>
                    <div className="gold-divider-small"></div>
                    <p className="invitation-subtitle">
                        We cordially invite you to join us in these sacred celebrations.
                    </p>
                </div>

                <div className="invitation-card">
                    <div className="invitation-img-wrapper">
                        <img
                            src={invitationImage}
                            alt="Special Church Invitation"
                            className="invitation-img"
                        />
                        <div className="invitation-shine"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SpecialInvitation;
