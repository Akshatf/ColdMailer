import React from 'react';
import './css/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <p>ColdMailer © 2025</p>
      {/* <p>akshatfarkya07@gmail.com</p> */}
      <a href='mailto:akshatfarkya07@gmail.com' className='footerMail'>akshatfarkya07@gmail.com</a>
    </footer>
  );
};

export default Footer;