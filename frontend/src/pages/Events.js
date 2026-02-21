import React from 'react';
import './Events.css';
import './EventsCategories.css';
import AnniversaryCountdown from '../components/AnniversaryCountdown';
import SmartEventHighlight from '../components/SmartEventHighlight';

const Events = () => {
    const specialEvents = [
        {
            id: 1,
            date: '24',
            month: 'January',
            year: '2026',
            title: 'ఉజ్జీవ వార్షిక కూటములు',
            description: 'Join us for an inspiring evening of worship, prayer, and the living word of God.',
            time: '10:00 AM & 6:00 PM',
            location: 'Bethesda Prayer Hall',
            featured: false
        },
        {
            id: 2,
            date: '25',
            month: 'January',
            year: '2026',
            title: 'ఉజ్జీవ వార్షిక కూటములు',
            description: 'Continue in fellowship as we gather to hear God\'s word and celebrate His presence.',
            time: '10:00 AM & 6:00 PM',
            location: 'Bethesda Prayer Hall',
            featured: false
        },
        {
            id: 3,
            date: '26',
            month: 'January',
            year: '2026',
            title: 'ఉజ్జీవ వార్షిక కూటములు',
            subtitle: '5th Year New Church Anniversary',
            description: 'A special celebration marking 5 years in our new church building! Join us for worship, testimonies, and a time of thanksgiving as we reflect on God\'s faithfulness.',
            time: '10:00 AM & 6:00 PM',
            location: 'Bethesda Prayer Hall',
            featured: true,
            badge: 'Special Day'
        }
    ];

    // Helper to parse date
    const getEventDate = (event) => {
        const monthMap = {
            'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
            'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
        };
        return new Date(event.year, monthMap[event.month], parseInt(event.date));
    };

    // Date Comparison Logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentEvents = [];
    const upcomingEvents = [];
    const recentEvents = [];

    specialEvents.forEach(event => {
        const eventDate = getEventDate(event);
        eventDate.setHours(0, 0, 0, 0);

        if (eventDate.getTime() === today.getTime()) {
            currentEvents.push(event);
        } else if (eventDate > today) {
            upcomingEvents.push(event);
        } else {
            recentEvents.push(event);
        }
    });

    // Render Event Card Helper
    let globalIndex = 0; // Reset index for strict alternation

    const renderEventCard = (event, type) => {
        globalIndex++;
        const isOdd = globalIndex % 2 !== 0; // 1-based index emulation for nth-child match
        const directionClass = isOdd ? 'item-odd' : 'item-even';

        let cardClass = `event-timeline-item ${directionClass}`;
        let badgeText = null;

        if (type === 'current') {
            cardClass += ' current-event-highlight';
            badgeText = 'Happening Today';
        } else if (type === 'recent') {
            cardClass += ' recent-event-dim';
            badgeText = 'Completed';
        } else if (event.featured) {
            cardClass += ' featured-event';
            badgeText = event.badge;
        }

        return (
            <div
                key={event.id}
                className={cardClass}
            >
                {badgeText && (
                    <div className={`event-badge ${type === 'current' ? 'badge-pulse' : ''}`}>
                        {badgeText}
                    </div>
                )}

                <div className="event-date-circle">
                    <div className="date-number">{event.date}</div>
                    <div className="date-month">{event.month}</div>
                </div>

                <div className="event-content">
                    <div className="event-icon">✝</div>
                    <h3 className="event-title">{event.title}</h3>
                    {event.subtitle && (
                        <p className="event-subtitle">🎉 {event.subtitle}</p>
                    )}
                    <p className="event-description">{event.description}</p>

                    <div className="event-details">
                        <div className="event-detail-item">
                            <span className="detail-icon">🕐</span>
                            <span>{event.time}</span>
                        </div>
                        <div className="event-detail-item">
                            <span className="detail-icon">📍</span>
                            <span>{event.location}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="events">
            <div className="events-header">
                <h1>Upcoming Events</h1>
                <div className="gold-divider"></div>
                <p className="events-intro">
                    Join us for these special celebrations and gatherings as we commemorate
                    our 6th Anniversary and continue our mission of faith and fellowship.
                </p>
            </div>

            {/* Smart Daily Highlight */}
            <SmartEventHighlight />

            {/* Anniversary Countdown */}
            <AnniversaryCountdown />

            <div className="events-container">
                <div className="events-timeline">
                    {/* Current Events Section */}
                    {currentEvents.length > 0 && (
                        <div className="section-group current-group">
                            {currentEvents.map(event => renderEventCard(event, 'current'))}
                        </div>
                    )}

                    {/* Upcoming Events Section */}
                    {upcomingEvents.length > 0 && (
                        <div className="section-group upcoming-group">
                            {upcomingEvents.map(event => renderEventCard(event, 'upcoming'))}
                        </div>
                    )}

                    {/* Recent Events Section */}
                    {recentEvents.length > 0 && (
                        <div className="section-group recent-group">
                            {recentEvents.map(event => renderEventCard(event, 'recent'))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Events;
