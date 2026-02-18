import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getFirebaseAuth } from '../../../services/firebase.service';
import { UserService, UserRole } from '../../../services/user.service';
import { onAuthStateChanged } from 'firebase/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthenticated(true);
        const profile = await UserService.getUserProfile(user.uid);
        setUserRole(profile?.role || 'editor'); // Default to editor if no profile
      } else {
        setAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Authentifizierung wird geprüft...</div>;

  if (!authenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole && userRole !== 'owner') {
    // If a specific role is required and user is neither that role nor owner
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};
