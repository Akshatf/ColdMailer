import React from 'react';
import './css/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-content">
        <div className="logo">
          <span className="logo-icon">🚀</span>
          ColdMailer
        </div>
        <div className="nav-links">
          {/* Navigation links can be added here */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;