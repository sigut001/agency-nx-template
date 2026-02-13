import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home } from './routes/Home';
import { NotFound } from './routes/NotFound';
import { AdminLogin } from './routes/AdminLogin';
import { AdminDashboard } from './routes/AdminDashboard';
import { AdminEditPage } from './routes/AdminEditPage';
import { AdminUsersPage } from './routes/AdminUsersPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { initFirebase } from './services/firebase.service';
import { APP_ROUTES } from './routes';

export function App() {
  useEffect(() => {
    // Firebase initialisieren
    try {
        initFirebase();
    } catch (e) {
        console.warn('Firebase initialization failed:', e);
    }
  }, []);


  return (
    <Routes>
      {APP_ROUTES.map((route) => (
        <Route 
          key={route.path} 
          path={route.path} 
          element={route.element} 
        />
      ))}
      
      {/* Admin Area */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route 
        path="/admin/dashboard" 
        element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} 
      />
      <Route 
        path="/admin/edit/:slug" 
        element={<ProtectedRoute><AdminEditPage /></ProtectedRoute>} 
      />
      <Route 
        path="/admin/users" 
        element={<ProtectedRoute requiredRole="owner"><AdminUsersPage /></ProtectedRoute>} 
      />

      {/* Dynamic CMS Pages (Catch-all for known slugs) */}
      <Route path="/:slug" element={<Home />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
