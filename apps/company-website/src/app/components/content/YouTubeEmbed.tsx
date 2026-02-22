import { useState, useEffect } from 'react';
import * as CookieConsent from 'vanilla-cookieconsent';

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
}

export const YouTubeEmbed = ({ videoId, title = 'YouTube Video' }: YouTubeEmbedProps) => {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    // Check initial state
    if (CookieConsent.acceptedCategory('marketing')) {
        setAllowed(true);
    }

    // Since we don't have a global listener hook easily available for specific components without context,
    // we can either poll or expose a custom event.
    // For this simple demo, we will just rely on the button click or Page Refresh for state update if "Accept All" was clicked elsewhere.
    // Ideally: Use a Context Provider wrapping the App that triggers re-renders on consent change.
    
  }, []);

  const handleAccept = () => {
      CookieConsent.acceptCategory('marketing');
      setAllowed(true);
  };

  if (!allowed) {
    return (
      <div 
        data-cookie-placeholder="youtube" 
        style={{ 
            background: '#eee', 
            padding: '2rem', 
            textAlign: 'center', 
            borderRadius: '8px',
            border: '1px solid #ccc'
        }}
      >
        <h3>Externe Inhalte blockiert</h3>
        <p>Um dieses Video anzusehen, müssen Sie Marketing-Cookies akzeptieren.</p>
        <button 
            onClick={handleAccept}
            style={{
                background: '#000',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                cursor: 'pointer',
                borderRadius: '4px'
            }}
        >
            Inhalt laden (YouTube)
        </button>
      </div>
    );
  }

  return (
    <div className="video-responsive">
      <iframe
        width="560"
        height="315"
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};
