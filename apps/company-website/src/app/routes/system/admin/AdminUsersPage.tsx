import React, { useEffect, useState } from 'react';
import { UserService, UserProfile, UserRole } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { getFirebaseApp } from '../../../services/firebase.service';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('editor');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    UserService.getAllUsers().then(setUsers);
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Erstelle Benutzer...');

    try {
      // 1. Sekundäre Auth-Instanz initialisieren, um den aktuellen Owner nicht auszuloggen
      const currentConfig = (getFirebaseApp() as any).options;
      const secondaryApp = initializeApp(currentConfig, 'SecondaryAuth');
      const secondaryAuth = getAuth(secondaryApp);

      // 2. Benutzer in Auth anlegen
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const newUid = userCredential.user.uid;

      // 3. Profil in Firestore anlegen
      await UserService.createUserProfile(newUid, {
        email,
        role,
        displayName: email.split('@')[0]
      });

      // 4. Sekundäre Instanz aufräumen
      await signOut(secondaryAuth);
      
      setStatus('Benutzer erfolgreich angelegt!');
      setEmail('');
      setPassword('');
      
      // Liste aktualisieren
      const updatedUsers = await UserService.getAllUsers();
      setUsers(updatedUsers);
    } catch (error: any) {
      console.error('Error creating user:', error);
      setStatus(`Fehler: ${error.message}`);
    }
  };

  return (
    <div className="admin-users" style={{ padding: '2rem' }}>
      <h1>Benutzerverwaltung</h1>
      
      <section style={{ marginBottom: '2rem', border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px' }}>
        <h3>Neuen Account anlegen</h3>
        <form onSubmit={handleCreateUser}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="userEmail">E-Mail</label><br/>
            <input id="userEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.5rem' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="userPassword">Passwort (Initial)</label><br/>
            <input id="userPassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '0.5rem' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="userRole">Rolle</label><br/>
            <select id="userRole" value={role} onChange={(e) => setRole(e.target.value as UserRole)} style={{ width: '100%', padding: '0.5rem' }}>
              <option value="editor">Editor (Inhalte pflegen)</option>
              <option value="owner">Owner (Voller Zugriff)</option>
            </select>
          </div>
          <button type="submit">Account erstellen</button>
        </form>
        {status && <p style={{ color: status.includes('Erfolg') ? 'green' : 'red' }}>{status}</p>}
      </section>

      <section>
        <h3>Existierende Benutzer</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '0.5rem' }}>E-Mail</th>
              <th style={{ padding: '0.5rem' }}>Rolle</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.uid} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem' }}>{u.email}</td>
                <td style={{ padding: '0.5rem' }}>
                   <span style={{ 
                     padding: '2px 8px', 
                     borderRadius: '4px', 
                     backgroundColor: u.role === 'owner' ? '#fee2e2' : '#f3f4f6',
                     color: u.role === 'owner' ? '#991b1b' : '#374151',
                     fontSize: '0.85rem'
                   }}>
                     {u.role.toUpperCase()}
                   </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <button onClick={() => navigate('/admin/dashboard')} style={{ marginTop: '2rem' }}>Zurück zum Dashboard</button>
    </div>
  );
};
