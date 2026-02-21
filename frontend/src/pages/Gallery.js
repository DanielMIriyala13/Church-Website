import React, { useState, useEffect } from 'react';
import { getGallery } from '../services/api';
import './Gallery.css';

const Gallery = () => {
    const [galleries, setGalleries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        try {
            const data = await getGallery();
            setGalleries(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching gallery:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading gallery...</div>;
    }

    return (
        <div className="gallery">
            <div className="gallery-header">
                <h1>Photo Gallery</h1>
                <div className="gold-divider"></div>
                <p className="gallery-intro">
                    Relive the precious moments and cherished memories from our 25-year journey.
                    Each photograph tells a story of faith, fellowship, and God's abundant blessings.
                </p>
            </div>

            <div className="container">
                <div className="gallery-grid">
                    {galleries.length > 0 ? (
                        galleries.map((item) => (
                            <div key={item._id} className="gallery-item">
                                <span className="gallery-category">{item.category || 'General'}</span>
                                <h3>{item.title}</h3>
                                <div className="images-container">
                                    {item.images.map((image, index) => (
                                        <img
                                            key={index}
                                            src={image}
                                            alt={`${item.title} ${index + 1}`}
                                            loading="lazy"
                                        />
                                    ))}
                                </div>
                                {item.description && <p>{item.description}</p>}
                            </div>
                        ))
                    ) : (
                        <p className="no-gallery">No gallery items available at the moment.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Gallery;
