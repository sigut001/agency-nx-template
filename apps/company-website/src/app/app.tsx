import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { NotFound } from './routes/system/infrastructure/NotFound';
import { AdminLogin } from './routes/system/admin/AdminLogin';
import { AdminDashboard } from './routes/system/admin/AdminDashboard';
import { AdminEditPage } from './routes/system/admin/AdminEditPage';
import { AdminUsersPage } from './routes/system/admin/AdminUsersPage';
import { ProtectedRoute } from './routes/system/infrastructure/ProtectedRoute';
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

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
