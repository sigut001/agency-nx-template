import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import { CMSService, PageContent } from '../services/cms.service';
import { UserService, UserRole } from '../services/user.service';

export const AdminDashboard: React.FC = () => {
  const [user, setUser] = useState(AuthService.getCurrentUser());
  const [pages, setPages] = useState<any[]>([]);
  const [role, setRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = AuthService.subscribe(async (u) => {
      if (!u) {
        navigate('/admin/login');
      } else {
        setUser(u);
        const profile = await UserService.getUserProfile(u.uid);
        setRole(profile?.role || 'editor');
      }
    });
    
    setPages([
      { slug: 'home', title: 'Startseite' },
      { slug: 'imprint', title: 'Impressum' }
    ]);

    return () => unsub();
  }, [navigate]);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/admin/login');
  };

  if (!user) return null;

  return (
    <div className="admin-dashboard" style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Admin Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {role === 'owner' && (
            <Link to="/admin/users" style={{ 
              backgroundColor: '#4f46e5', 
              color: 'white', 
              padding: '0.5rem 1rem', 
              borderRadius: '6px',
              textDecoration: 'none'
            }}>
              Benutzer verwalten
            </Link>
          )}
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <section style={{ marginTop: '2rem' }}>
        <h2>Seiten verwalten</h2>
        <ul>
          {pages.map(p => (
            <li key={p.slug} style={{ marginBottom: '1rem' }}>
              <strong>{p.title}</strong> ({p.slug}) 
              <Link to={`/admin/edit/${p.slug}`} style={{ marginLeft: '1rem' }}>Bearbeiten</Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
