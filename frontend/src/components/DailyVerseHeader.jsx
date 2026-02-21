import React, { useState, useEffect } from 'react';
import './DailyVerseHeader.css';

const verses = [
    { text: "యెహోవా నా కాపరి; నాకు కొరతలేదు.", ref: "కీర్తనలు 23:1" },
    { text: "దేవుడు లోకమును అంతగా ప్రేమించెను.", ref: "యోహాను 3:16" },
    { text: "యెహోవా మీకు తోడుగా ఉన్నాడు.", ref: "యెహోషువ 1:9" },
    { text: "యెహోవా నా వెలుగు, నా రక్షణ.", ref: "కీర్తనలు 27:1" },
    { text: "యెహోవా మీద నీ భారమును వేసుకొనుము.", ref: "కీర్తనలు 55:22" },
    { text: "నా కృప నీకు చాలును.", ref: "2 కొరింథీయులకు 12:9" },
    { text: "యెహోవా నిన్ను ఆశీర్వదించును.", ref: "సంఖ్యాకాండము 6:24" },
    { text: "యెహోవా కీడు రాకుండ నిన్ను దాచి కాపాడును.", ref: "కీర్తనలు 121:7" },
    { text: "ప్రభువునందు ఆనందించుడి.", ref: "ఫిలిప్పీయులకు 4:4" },
    { text: "నీ పనులన్నిటిని యెహోవాకు అప్పగింపుము.", ref: "సామెతలు 16:3" }
];

const DailyVerseHeader = () => {

    const [currentVerse, setCurrentVerse] = useState(verses[0]);
    const [animationKey, setAnimationKey] = useState(0);

    useEffect(() => {
        // Daily rotation logic
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const day = Math.floor(diff / oneDay);

        const verseIndex = day % verses.length;
        setCurrentVerse(verses[verseIndex]);
        setAnimationKey(day); // Trigger animation on load
    }, []);



    return (
        <div className="daily-verse-section">
            <div className="verse-glow-effect"></div>

            <div className="verse-card-container" key={animationKey}>
                <div className="verse-header-label">
                    <span className="label-icon">✦</span>
                    <span className="label-text">Today's Verse</span>
                    <span className="label-icon">✦</span>
                </div>

                <div className="verse-content-body">
                    <p className="verse-scripture">"{currentVerse.text}"</p>
                    <div className="verse-separator"></div>
                    <span className="verse-reference">{currentVerse.ref}</span>
                </div>


            </div>
        </div>
    );
};

export default DailyVerseHeader;
