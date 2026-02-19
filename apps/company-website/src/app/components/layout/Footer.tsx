import React from 'react';
import { Link } from 'react-router';

export const Footer: React.FC = () => {
  return (
    <footer className="agency-footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Qubits Digital</p>
        <ul className="footer-links">
          <li><Link to="/impressum">Impressum</Link></li>
          <li><Link to="/datenschutz">Datenschutz</Link></li>
          <li><Link to="/agb">AGB</Link></li>
          <li><Link to="/lizenzen">Lizenzen</Link></li>
        </ul>
      </div>
    </footer>
  );
};
