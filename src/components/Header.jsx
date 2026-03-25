import React from 'react';
import './Header.css'; 

const HeaderSimple = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo-container">
          <img src="/visual-core-digital-logo.png" alt="Logo" className="nav-logo-icon" />
          <div className="nav-title">
            Visual Core <span className="title-highlight">Digital</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default HeaderSimple;