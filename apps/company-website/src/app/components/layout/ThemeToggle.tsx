import React, { useEffect, useState } from 'react';

export const ThemeToggle: React.FC = () => {
  const [current, setCurrent] = useState<'light' | 'dark' | 'auto'>('auto');

  // Initial check: is there already an attribute on html?
  useEffect(() => {
    console.error('%c[ThemeToggle] HYDRATION SUCCESSFUL!', 'background: #ff00ff; color: #fff; font-size: 20px; padding: 10px;');
    if (typeof window !== 'undefined') {
       // window.alert('ThemeToggle is ALIVE!'); // Temporär deaktiviert, um Benutzer nicht zu nerven, aber console.error ist drin
    }
    const attr = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' | null;
    if (attr) setCurrent(attr);
    console.log('[ThemeToggle] Native current theme attribute:', attr || 'auto (system)');
  }, []);

  const toggleTheme = () => {
    console.log("!!! USER REQUESTED THEME TOGGLE CLICK !!!"); // <--- ADDED AS REQUESTED
    const html = document.documentElement;
    const isDarkNow = html.getAttribute('data-theme') === 'dark' || 
                     (!html.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    const next = isDarkNow ? 'light' : 'dark';
    
    console.log(`[ThemeToggle] NATIVE TOGGLE: Setting data-theme to ${next}`);
    html.setAttribute('data-theme', next);
    setCurrent(next);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex items-center gap-2 p-2 rounded-lg border-2 border-primary bg-secondary/5 hover:bg-secondary/10 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 relative z-[9999] cursor-pointer"
      aria-label="Toggle Theme"
      style={{ minWidth: '120px' }}
    >
      <span className="text-xs font-bold uppercase text-primary">Mode</span>
      {current === 'dark' ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
        </svg>
      )}
    </button>
  );
};
