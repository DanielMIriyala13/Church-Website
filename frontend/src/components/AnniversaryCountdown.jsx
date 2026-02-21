import React, { useState, useEffect } from 'react';
import './AnniversaryCountdown.css';

const AnniversaryCountdown = () => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    const [isAnniversary, setIsAnniversary] = useState(false);

    function calculateTimeLeft() {
        // Target date: January 26th of current year
        const currentYear = new Date().getFullYear();
        const targetDate = new Date(`${currentYear}-01-26T00:00:00`);
        const now = new Date();

        // If target date has passed for this year, check if it's today
        // Otherwise, no countdown needed (or could target next year, but req is specifically for 26th)

        const difference = targetDate - now;

        // Check if it's currently the 26th
        const isToday = now.getDate() === 26 && now.getMonth() === 0; // 0 = January

        if (isToday) {
            return { special: 'today' };
        }

        if (difference > 0) {
            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }

        // If passed
        return { special: 'passed' };
    }

    useEffect(() => {
        const timer = setInterval(() => {
            const time = calculateTimeLeft();
            setTimeLeft(time);

            if (time.special === 'today') {
                setIsAnniversary(true);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Render logic
    const renderContent = () => {
        if (timeLeft.special === 'today') {
            return (
                <div className="countdown-celebration">
                    <div className="celebration-icon">🎉</div>
                    <h2 className="celebration-title">Today is the 6th Anniversary Celebration!</h2>
                    <p className="celebration-subtitle">Join us in celebrating 6 years of God's faithfulness.</p>
                </div>
            );
        }

        if (timeLeft.special === 'passed') {
            // Optional handling for after the date (can hide or show generic message)
            // For now, defaulting to hiding or could show a "Thank you for celebrating" message
            return null;
        }

        return (
            <>
                <div className="countdown-header">
                    <h2 className="countdown-title">Countdown to 6th Anniversary</h2>
                    <div className="gold-divider-small"></div>
                    <p className="countdown-subtitle">Join us as we celebrate the 6th Anniversary of our new church.</p>
                </div>

                <div className="countdown-grid">
                    <div className="countdown-block">
                        <span className="countdown-number">{String(timeLeft.days).padStart(2, '0')}</span>
                        <span className="countdown-label">Days</span>
                    </div>
                    <div className="countdown-separator">:</div>
                    <div className="countdown-block">
                        <span className="countdown-number">{String(timeLeft.hours).padStart(2, '0')}</span>
                        <span className="countdown-label">Hours</span>
                    </div>
                    <div className="countdown-separator">:</div>
                    <div className="countdown-block">
                        <span className="countdown-number">{String(timeLeft.minutes).padStart(2, '0')}</span>
                        <span className="countdown-label">Minutes</span>
                    </div>
                    <div className="countdown-separator">:</div>
                    <div className="countdown-block">
                        <span className="countdown-number">{String(timeLeft.seconds).padStart(2, '0')}</span>
                        <span className="countdown-label">Seconds</span>
                    </div>
                </div>
            </>
        );
    };

    if (timeLeft.special === 'passed') return null;

    return (
        <section className={`anniversary-countdown-section ${isAnniversary ? 'celebration-mode' : ''}`}>
            <div className="countdown-glow-bg"></div>

            <div className="countdown-container">
                {renderContent()}
            </div>
        </section>
    );
};

export default AnniversaryCountdown;
