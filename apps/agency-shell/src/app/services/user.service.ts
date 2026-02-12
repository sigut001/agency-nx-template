import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { getFirebaseDb } from './firebase.service';

export type UserRole = 'owner' | 'editor';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
}

export const UserService = {
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const db = getFirebaseDb();
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return { uid, ...userDoc.data() } as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const db = getFirebaseDb();
      const querySnapshot = await getDocs(collection(db, 'users'));
      return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  },

  async createUserProfile(uid: string, profile: Omit<UserProfile, 'uid'>): Promise<void> {
    try {
      const db = getFirebaseDb();
      await setDoc(doc(db, 'users', uid), profile);
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  },

  async isOwner(uid: string): Promise<boolean> {
    const profile = await this.getUserProfile(uid);
    return profile?.role === 'owner';
  }
};
