import React from 'react';
import { Link } from 'react-router';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-secondary/20 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="logo text-xl font-bold text-primary">
          <Link to="/">Qubits Digital</Link>
        </div>
        <ul className="flex items-center gap-8 font-medium">
          <li>
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          </li>
          <li>
            <Link to="/#services" className="hover:text-primary transition-colors">Leistungen</Link>
          </li>
          <li>
            <Link to="/kontakt" className="hover:text-primary transition-colors">Kontakt</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};
