import React from 'react';
import './About.css';
import pastorImage from '../assets/pastor-miriyala.jpg';

const About = () => {
    return (
        <div className="about">
            <div className="about-hero">
                <h1>About Our Church</h1>
                <div className="gold-divider"></div>
                <p className="about-intro">
                    Our church has been a beacon of faith and hope in the community for 25 years.
                    We are dedicated to spreading God's love and serving our community with compassion and grace.
                </p>
            </div>

            <div className="about-content">
                <div className="mission-vision-grid">
                    <div className="mission">
                        <div className="mission-icon">✝</div>
                        <h2>Our Mission</h2>
                        <p>
                            To glorify God through worship, fellowship, and service to others.
                            We strive to create a welcoming community where every person can
                            encounter God's transforming love and grow in their faith journey.
                        </p>
                    </div>

                    <div className="vision">
                        <div className="vision-icon">🕊</div>
                        <h2>Our Vision</h2>
                        <p>
                            To be a thriving community of believers who transform lives through Christ's love.
                            We envision a church that reaches beyond its walls, bringing hope, healing,
                            and the message of salvation to our community and the world.
                        </p>
                    </div>
                </div>

                <div className="pastor-section">
                    <div className="gold-divider"></div>
                    <h2>Meet Our Pastor</h2>
                    <div className="pastor-card">
                        <div className="pastor-image-container">
                            <img src={pastorImage} alt="Dr. Miriyala Baburao" className="pastor-image" />
                        </div>
                        <div className="pastor-info">
                            <h3>Dr. Miriyala Baburao</h3>
                            <p className="pastor-title">Pastor</p>
                            <p className="pastor-description">
                                Leading our congregation with wisdom, compassion, and unwavering faith for 25 years.
                                Dr. Baburao's dedication to spreading God's word has touched countless lives and
                                built a strong foundation of faith in our community.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="values-section">
                    <h2>Our Core Values</h2>
                    <div className="gold-divider"></div>
                    <div className="values-grid">
                        <div className="value-card">
                            <div className="value-icon">🙏</div>
                            <h3>Faith</h3>
                            <p>Rooted in Scripture and guided by the Holy Spirit</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">❤️</div>
                            <h3>Love</h3>
                            <p>Showing Christ's compassion to all people</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">🤝</div>
                            <h3>Fellowship</h3>
                            <p>Building authentic relationships and community</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">🌟</div>
                            <h3>Service</h3>
                            <p>Using our gifts to serve God and others</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
