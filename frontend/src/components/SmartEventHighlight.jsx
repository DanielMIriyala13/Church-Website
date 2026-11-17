import React, { useState, useEffect } from 'react';
import './SmartEventHighlight.css';

const SmartEventHighlight = () => {
    const [todaysEvent, setTodaysEvent] = useState(null);

    useEffect(() => {
        const checkEvent = () => {
            const now = new Date();
            const month = now.getMonth(); // 0 = January
            const day = now.getDate();

            // Only active for Jan 24, 25, 26
            if (month !== 0) return;

            let eventDetails = null;

            if (day === 24) {
                eventDetails = {
                    day: 1,
                    title: "ఉజ్జీవ వార్షిక కూటములు",
                    subtitle: "ఈ రోజు ప్రత్యేక కూటములు – ఉదయం 10:00 & సాయంత్రం 6:00",
                    badge: "Happening Today • Day 1",
                    isAnniversary: false
                };
            } else if (day === 25) {
                eventDetails = {
                    day: 2,
                    title: "ఉజ్జీవ వార్షిక కూటములు",
                    subtitle: "ఈ రోజు ప్రత్యేక కూటములు – ఉదయం 10:00 & సాయంత్రం 6:00",
                    badge: "Happening Today • Day 2",
                    isAnniversary: false
                };
            } else if (day === 26) {
                eventDetails = {
                    day: 3,
                    title: "ఉజ్జీవ వార్షిక కూటములు",
                    extraTitle: " & 6th Anniversary Celebration",
                    subtitle: "ఈ రోజు ప్రత్యేక కూటములు – ఉదయం 10:00 & సాయంత్రం 6:00",
                    badge: "Grand Celebration • Today",
                    isAnniversary: true
                };
            }

            setTodaysEvent(eventDetails);
        };

        checkEvent();
    }, []);

    if (!todaysEvent) return null;

    return (
        <div className={`smart-highlight-container ${todaysEvent.isAnniversary ? 'highlight-anniversary' : ''}`}>
            <div className="smart-highlight-glass">
                <div className="smart-glow-effect"></div>

                <div className="highlight-badge-wrapper">
                    <span className="highlight-badge">
                        <span className="live-dot"></span>
                        {todaysEvent.badge}
                    </span>
                </div>

                <div className="highlight-content-group">
                    <div className="highlight-text-stack">
                        <h2 className="highlight-title">
                            {todaysEvent.day && <span className="day-counter">Day {todaysEvent.day} –</span>}
                            {todaysEvent.title}
                            {todaysEvent.extraTitle && <span className="extra-title">{todaysEvent.extraTitle}</span>}
                        </h2>
                        <p className="highlight-subtitle">{todaysEvent.subtitle}</p>
                    </div>
                </div>

                {/* Actions removed as requested, just the location tag */}
                <div className="highlight-actions">
                    <span className="location-tag">📍 Bethesda Prayer Hall</span>
                </div>
            </div>
        </div>
    );
};

export default SmartEventHighlight;
