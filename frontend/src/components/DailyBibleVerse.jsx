import React, { useState, useEffect } from 'react';
import './DailyBibleVerse.css';

const DailyBibleVerse = () => {
    // Collection of inspiring Bible verses
    const verses = [
        {
            text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
            reference: "Jeremiah 29:11"
        },
        {
            text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
            reference: "Proverbs 3:5-6"
        },
        {
            text: "I can do all things through Christ who strengthens me.",
            reference: "Philippians 4:13"
        },
        {
            text: "The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.",
            reference: "Psalm 23:1-3"
        },
        {
            text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
            reference: "Joshua 1:9"
        },
        {
            text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
            reference: "Romans 8:28"
        },
        {
            text: "The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you; the Lord turn his face toward you and give you peace.",
            reference: "Numbers 6:24-26"
        },
        {
            text: "Cast all your anxiety on him because he cares for you.",
            reference: "1 Peter 5:7"
        },
        {
            text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
            reference: "Isaiah 40:31"
        },
        {
            text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
            reference: "John 3:16"
        },
        {
            text: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.",
            reference: "Psalm 34:18"
        },
        {
            text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.",
            reference: "Philippians 4:6"
        },
        {
            text: "Come to me, all you who are weary and burdened, and I will give you rest.",
            reference: "Matthew 11:28"
        },
        {
            text: "The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you; in his love he will no longer rebuke you, but will rejoice over you with singing.",
            reference: "Zephaniah 3:17"
        },
        {
            text: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.",
            reference: "John 14:27"
        }
    ];

    const [currentVerse, setCurrentVerse] = useState(null);

    // Get verse for today based on day of year
    const getDailyVerse = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);

        // Use day of year to select verse (cycles through the array)
        const verseIndex = dayOfYear % verses.length;
        return verses[verseIndex];
    };

    useEffect(() => {
        setCurrentVerse(getDailyVerse());
    }, []);

    const handleRefresh = () => {
        // Get a random verse on refresh
        const randomIndex = Math.floor(Math.random() * verses.length);
        setCurrentVerse(verses[randomIndex]);
    };

    if (!currentVerse) return null;

    return (
        <section className="daily-verse-section">
            <div className="verse-glow-bg"></div>

            <div className="verse-container">
                <div className="verse-header">
                    <div className="verse-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C10.9 2 10 2.9 10 4V5.17C8.83 5.58 8 6.69 8 8V20C8 21.1 8.9 22 10 22H14C15.1 22 16 21.1 16 20V8C16 6.69 15.17 5.58 14 5.17V4C14 2.9 13.1 2 12 2ZM12 4C12.55 4 13 4.45 13 5V6H11V5C11 4.45 11.45 4 12 4ZM10 8H14V20H10V8Z"
                                fill="currentColor" />
                        </svg>
                    </div>
                    <h3 className="verse-title">Today's Verse</h3>
                    <button
                        className="refresh-btn"
                        onClick={handleRefresh}
                        aria-label="Get another verse"
                        title="Get another verse"
                    >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
                                fill="currentColor" />
                        </svg>
                    </button>
                </div>

                <div className="verse-content">
                    <div className="verse-quote-icon">"</div>
                    <p className="verse-text">{currentVerse.text}</p>
                    <p className="verse-reference">— {currentVerse.reference}</p>
                </div>
            </div>
        </section>
    );
};

export default DailyBibleVerse;
