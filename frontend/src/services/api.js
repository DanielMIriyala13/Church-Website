const API_URL = 'http://localhost:5000/api';

// Events API
export const getEvents = async () => {
    const response = await fetch(`${API_URL}/events`);
    return response.json();
};

export const getEvent = async (id) => {
    const response = await fetch(`${API_URL}/events/${id}`);
    return response.json();
};

export const createEvent = async (eventData) => {
    const response = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
    });
    return response.json();
};

// Gallery API
export const getGallery = async () => {
    const response = await fetch(`${API_URL}/gallery`);
    return response.json();
};

export const createGallery = async (galleryData) => {
    const response = await fetch(`${API_URL}/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(galleryData),
    });
    return response.json();
};

// Announcements API
export const getAnnouncements = async () => {
    const response = await fetch(`${API_URL}/announcements`);
    return response.json();
};

export const createAnnouncement = async (announcementData) => {
    const response = await fetch(`${API_URL}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcementData),
    });
    return response.json();
};

// Contact API
export const createContact = async (contactData) => {
    const response = await fetch(`${API_URL}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData),
    });
    return response.json();
};
