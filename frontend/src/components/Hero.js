import React from 'react';
import './css/Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <h1 className="hero-headline">
        AI-Powered Job Application
        <br />
        Email Generator
      </h1>
      <p className="hero-subtitle">
        Transform your job search with personalized, professional emails 
        crafted by AI. Get more interviews with emails that stand out and 
        make hiring managers take notice.
      </p>
      
      <div className="hero-features">
        <div className="feature">
          <span className="feature-icon">⚡</span>
          <span>Generate in seconds</span>
        </div>
        <div className="feature">
          <span className="feature-icon">🎯</span>
          <span>Personalized content</span>
        </div>
        <div className="feature">
          <span className="feature-icon">🚀</span>
          <span>Higher response rate</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;