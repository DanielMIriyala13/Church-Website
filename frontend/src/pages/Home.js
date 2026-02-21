import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import ChurchLocationMap from '../components/ChurchLocationMap';

import AnniversaryCountdown from '../components/AnniversaryCountdown';
import SpecialInvitation from '../components/SpecialInvitation';
import DailyVerseHeader from '../components/DailyVerseHeader';

const Home = () => {
    return (
        <div className="home">
            <DailyVerseHeader />
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-badge">Celebrating 25 Years</div>
                    <h1 className="hero-title">6th Anniversary Celebrations</h1>
                    <p className="hero-subtitle">Celebrating 6th Anniversary - 25 Years of Faith, Fellowship & Service</p>
                    <div className="hero-buttons">
                        <Link to="/jubilee" className="btn-primary">Explore Our Journey</Link>
                        <Link to="/events" className="btn-secondary">View Events</Link>
                    </div>
                </div>
            </section>

            {/* Anniversary Countdown */}
            <AnniversaryCountdown />

            {/* Special Invitation Banner */}
            <SpecialInvitation />

            {/* YouTube Section */}
            <section className="youtube-section">
                <div className="gold-divider"></div>
                <div className="youtube-container">
                    <div className="youtube-header">
                        <h2>Watch Our Messages</h2>
                        <p>Join us online and be blessed by our latest messages and worship sessions.</p>
                    </div>

                    <div className="youtube-video-wrapper">
                        <div className="video-glow"></div>
                        <div className="youtube-embed">
                            <iframe
                                width="100%"
                                height="100%"
                                src="https://www.youtube.com/embed/OyvoEYLPq0w"
                                title="Church YouTube Channel"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>

                    <a
                        href="https://www.youtube.com/@BCS_BaburaoMiriyala"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="youtube-button"
                    >
                        <svg className="youtube-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                        Visit Our YouTube Channel
                    </a>
                </div>
            </section>

            <section className="welcome">
                <div className="gold-divider"></div>
                <div className="welcome-content">
                    <h2>Welcome to Our Church</h2>
                    <p>
                        Join us as we celebrate 25 years of God's grace and blessings in our community.
                        Together, we have grown in faith, strengthened our fellowship, and served with love.
                    </p>
                    <p>
                        This 6th Anniversary marks a sacred milestone in our journey—a testament to the
                        countless prayers, devoted hearts, and unwavering commitment of our church family.
                    </p>
                </div>

                <div className="milestone-stats">
                    <div className="stat-card">
                        <span className="stat-number">25</span>
                        <span className="stat-label">Years of Faith</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">1000+</span>
                        <span className="stat-label">Families Blessed</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">500+</span>
                        <span className="stat-label">Events Hosted</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">∞</span>
                        <span className="stat-label">God's Grace</span>
                    </div>
                </div>
            </section>

            {/* Church Location Map */}
            <ChurchLocationMap />


        </div>
    );
};

export default Home;
