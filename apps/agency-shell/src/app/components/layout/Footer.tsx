import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="agency-footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Agency Blueprint</p>
        <ul className="footer-links">
          <li><Link to="/impressum">Impressum</Link></li>
          <li><Link to="/datenschutz">Datenschutz</Link></li>
          <li><Link to="/agb">AGB</Link></li>
        </ul>
      </div>
    </footer>
  );
};
