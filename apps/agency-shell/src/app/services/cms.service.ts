import { collection, query, where, getDocs, doc, getDoc, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { getFirebaseDb } from './firebase.service';

export interface PageContent {
  id: string;
  title: string;
  content: string;
  slug: string;
  seo?: {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
  };
  [key: string]: any;
}

export const CMSService = {
  async getPageBySlug(slug: string): Promise<PageContent | null> {
    try {
      const db = getFirebaseDb();
      const pagesRef = collection(db, 'pages');
      const q = query(pagesRef, where('slug', '==', slug));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0];
        return { id: docData.id, ...docData.data() } as PageContent;
      }
      return null;
    } catch (error) {
      console.error('Error fetching page from CMS:', error);
      return null;
    }
  },

  async getNavigation(): Promise<any[]> {
    try {
      const db = getFirebaseDb();
      const navDoc = await getDoc(doc(db, 'config', 'navigation'));
      if (navDoc.exists()) {
        return navDoc.data().items || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching navigation from CMS:', error);
      return [];
    }
  },

  async saveHistoryEntry(slug: string, data: any): Promise<void> {
    try {
      const db = getFirebaseDb();
      const historyRef = collection(db, 'pages', slug, 'history');
      await addDoc(historyRef, {
        ...data,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving history entry:', error);
    }
  },

  async getHistoryEntries(slug: string): Promise<any[]> {
    try {
      const db = getFirebaseDb();
      const historyRef = collection(db, 'pages', slug, 'history');
      const q = query(historyRef, orderBy('createdAt', 'desc'), limit(20));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() // Convert Firestore Timestamp to Date
      }));
    } catch (error) {
      console.error('Error fetching history entries:', error);
      return [];
    }
  }
};
