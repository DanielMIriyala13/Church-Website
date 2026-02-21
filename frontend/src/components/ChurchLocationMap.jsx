import React from 'react';
import './ChurchLocationMap.css';

const ChurchLocationMap = () => {
    const churchLocation = "https://www.google.com/maps/place/LEF+Bethesda+Church+Kadapa+City/@14.4786512,78.8028147,17.7z/data=!4m6!3m5!1s0x3bb37225f8fd6429:0x56c13c7bfee5987c!8m2!3d14.4770208!4d78.8044443!16s%2Fg%2F11f5djywlp";

    const handleGetDirections = () => {
        window.open(churchLocation, '_blank', 'noopener,noreferrer');
    };

    return (
        <section className="church-location-section">
            <div className="location-glow-bg"></div>

            <div className="location-container">
                <div className="location-header">
                    <div className="location-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                                fill="currentColor" />
                        </svg>
                    </div>
                    <h2 className="location-title">Visit Us</h2>
                    <p className="location-subtitle">We warmly welcome you to worship with us.</p>
                </div>

                <div className="map-wrapper">
                    <div className="map-glow"></div>
                    <div className="map-container">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3825.8447890234567!2d78.80281470000001!3d14.4770208!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb37225f8fd6429%3A0x56c13c7bfee5987c!2sLEF%20Bethesda%20Church%20Kadapa%20City!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="LEF Bethesda Church Kadapa City Location"
                        ></iframe>
                    </div>
                </div>

                <div className="location-details">
                    <div className="detail-item">
                        <div className="detail-icon">📍</div>
                        <div className="detail-content">
                            <h4>Address</h4>
                            <p>LEF Bethesda Church, Kadapa City</p>
                        </div>
                    </div>

                    <button className="get-directions-btn" onClick={handleGetDirections}>
                        <svg className="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" fill="currentColor" />
                        </svg>
                        Get Directions
                    </button>
                </div>
            </div>
        </section>
    );
};

export default ChurchLocationMap;
