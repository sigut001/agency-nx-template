import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase.service';

export const AuthService = {
  async login(email: string, pass: string) {
    const auth = getFirebaseAuth();
    return signInWithEmailAndPassword(auth, email, pass);
  },

  async logout() {
    const auth = getFirebaseAuth();
    return signOut(auth);
  },

  subscribe(callback: (user: User | null) => void) {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, callback);
  },

  getCurrentUser() {
    return getFirebaseAuth().currentUser;
  }
};
