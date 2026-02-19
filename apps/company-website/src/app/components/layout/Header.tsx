import React from 'react';
import { Link } from 'react-router';

export const Header: React.FC = () => {
  return (
    <header className="agency-header">
      <nav>
        <div className="logo">
          <Link to="/">Qubits Digital</Link>
        </div>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/#services">Leistungen</Link></li>
          <li><Link to="/kontakt">Kontakt</Link></li>
        </ul>
      </nav>
    </header>
  );
};
