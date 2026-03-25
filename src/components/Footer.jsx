import React from 'react';
import './Footer.css';

const Footer = () => {
  // Obtenemos el año actual automáticamente
  const currentYear = new Date().getFullYear();

  return (
    <footer className="main-footer">
      <div className="container-general">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-logo-group">
              <img src="/visual-core-digital-logo.png" alt="VisualCore Logo" className="footer-logo-icon" />
              <div className="footer-title">
                Visual Core <span className="title-highlight">Digital</span>
              </div>
            </div>
            <p className="footer-tagline">
              Transformación digital con respaldo senior y sello de ingeniería.
            </p>
          </div>

          <div className="footer-info">
            <h4>Contacto</h4>
            <p>📍 Santiago, Chile</p>
            <p>✉️ visualcoredigital@gmail.com</p>
          </div>

          <div className="footer-social">
            <h4>Conectemos</h4>
            <a 
              href="https://www.linkedin.com/in/francisco-javier-chac%C3%B3n-morales-71222117/" 
              target="_blank" 
              rel="noreferrer"
            >
              LinkedIn →
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Visual Core Digital - Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;