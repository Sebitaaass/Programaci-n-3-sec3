import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function HeroBanner() {
    const { t } = useLanguage();

    return (
        <section className="hero-section">
            {/* Background Image */}
            <div className="hero-background-container">
                <img className="hero-background-image" src="/hero-image.jpg" alt="" />
            </div>

            <div className="hero-content">
                {/* Badge */}
                <div className="hero-badge">✱✱✱</div>

                {/* Main Title */}
                <div className="hero-title-wrapper">
                    <h1 className="hero-title">
                        {t.hero.title}
                    </h1>
                </div>

                {/* Subtitle */}
                <p className="hero-subtitle">
                    <strong>{t.hero.subtitle}</strong>
                </p>

                <button className="primary-btn" style={{
                    marginTop: '1rem',
                    padding: '12px 24px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    backgroundColor: 'white',
                    color: 'black',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                }}>
                    {t.hero.shopNow}
                </button>

                <p className="hero-disclaimer">
                    {t.hero.disclaimer}
                </p>
            </div>

            {/* CSS Animation & Styles */}
            <style>{`
                .hero-section {
                    position: relative;
                    overflow: hidden;
                    height: 60vh; /* Smaller for mobile */
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }
                @media (min-width: 481px) {
                    .hero-section {
                        height: 80vh;
                    }
                }
                .hero-section .hero-background-container {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 0;
                }
                .hero-section .hero-background-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    filter: blur(4px);
                    transform: scale(1.1);
                }
                .hero-section .hero-content {
                    position: relative;
                    z-index: 2;
                    color: white;
                    text-shadow: 0 4px 8px rgba(0,0,0,0.4);
                    max-width: 800px;
                    padding: 20px;
                }
                .hero-section .hero-badge {
                    color: white;
                    margin-bottom: 1rem;
                }
                .hero-section .hero-title {
                    position: relative;
                    z-index: 2;
                    color: white;
                    font-size: 2.5rem; /* Mobile size */
                    line-height: 1.1;
                    margin-bottom: 1rem;
                }
                @media (min-width: 481px) {
                    .hero-section .hero-title {
                        font-size: 4rem;
                    }
                }
                .hero-section .hero-subtitle {
                    color: white;
                    font-size: 1.1rem; /* Mobile size */
                    margin-bottom: 1.5rem;
                }
                @media (min-width: 481px) {
                    .hero-section .hero-subtitle {
                        font-size: 1.5rem;
                    }
                }
                .hero-section .hero-disclaimer {
                    color: rgba(255, 255, 255, 0.8);
                    margin-top: 2rem;
                    font-size: 0.75rem;
                }
                .hero-section .primary-btn:hover {
                    transform: scale(1.05);
                    background-color: #ffeb3b !important;
                }
            `}</style>
        </section>
    );
}
