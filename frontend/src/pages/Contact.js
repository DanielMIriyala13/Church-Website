import React, { useState } from 'react';
import { createContact } from '../services/api';
import './Contact.css';
import ChurchLocationMap from '../components/ChurchLocationMap';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createContact(formData);
            setSubmitted(true);
            setFormData({ name: '', email: '', phone: '', message: '' });
            setTimeout(() => setSubmitted(false), 5000);
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    return (
        <div className="contact">
            <div className="contact-header">
                <h1>Contact Us</h1>
                <div className="gold-divider"></div>
                <p className="contact-intro">
                    We'd love to hear from you. Whether you have questions, prayer requests,
                    or would like to join our community, please reach out to us.
                </p>
            </div>

            <div className="container">
                <div className="contact-content">
                    <div className="contact-info">
                        <h2>Get in Touch</h2>
                        <p>
                            Our doors and hearts are always open. Connect with us and become
                            part of our church family as we celebrate 25 years of faith together.
                        </p>

                        <div className="info-item">
                            <h3>Address</h3>
                            <p>LEF Bethesda Church,<br />Bethesda Nagar,<br />Near Built-Up Circle,<br />Kadapa, AP 516001.</p>
                        </div>

                        <div className="info-item">
                            <h3>Phone</h3>
                            <p>+91 7893433236<br />+91 9490096556</p>
                        </div>

                        <div className="info-item">
                            <h3>Email</h3>
                            <p>lefbethesdachurch@gmail.com</p>
                        </div>

                        <div className="info-item">
                            <h3>Service Times</h3>
                            <p>Sunday: 9:30 AM & 12:30 PM<br />Wednesday: 7:30 PM<br />Saturday: 7:30 PM</p>
                        </div>
                    </div>

                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Your Name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="your.email@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                placeholder="(123) 456-7890"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="message">Your Message *</label>
                            <textarea
                                id="message"
                                name="message"
                                placeholder="Share your thoughts, prayer requests, or questions..."
                                rows="6"
                                value={formData.message}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>

                        <button type="submit">Send Message</button>

                        {submitted && (
                            <p className="success-message">
                                ✓ Thank you! Your message has been sent successfully. We'll get back to you soon.
                            </p>
                        )}
                    </form>
                </div>
            </div>

            {/* Church Location Map */}
            <ChurchLocationMap />
        </div>
    );
};

export default Contact;
