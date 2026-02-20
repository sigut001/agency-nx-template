import { Link } from 'react-router';

import { ThemeToggle } from './ThemeToggle';
import { showCookiePreferences } from '../legal/CookieLogic';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-secondary/20 bg-secondary/5 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
        <p className="text-sm opacity-60">
          &copy; {new Date().getFullYear()} Qubits Digital
        </p>
        <div className="flex items-center gap-8">
          <ul className="flex items-center gap-4 text-sm font-medium opacity-80">
            <li><Link to="/impressum" className="hover:text-primary transition-colors">Impressum</Link></li>
            <li><Link to="/datenschutz" className="hover:text-primary transition-colors">Datenschutz</Link></li>
            <li>
              <button 
                onClick={showCookiePreferences}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                Cookie-Einstellungen
              </button>
            </li>
            <li><Link to="/agb" className="hover:text-primary transition-colors">AGB</Link></li>
            <li><Link to="/lizenzen" className="hover:text-primary transition-colors">Lizenzen</Link></li>
          </ul>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
};
