import { collection, query, getDocs, doc, getDoc, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { getFirebaseDb } from './firebase.service';

export interface PageContent {
  id: string;
  title: string;
  content: string;
  slug: string;
  seo?: {
    title: string;
    description: string;
    keywords?: string;
    ogImage?: string;
    structuredData?: any;
  };
  [key: string]: any;
}

export const CMSService = {
  async getPageBySlug(slug: string, collectionName = 'static_pages'): Promise<PageContent | null> {
    try {
      const db = getFirebaseDb();
      // Support nested paths like 'static_pages/home'
      const pathParts = collectionName.split('/');
      
      let ref;
      if (pathParts.length > 1) {
         // It's a nested path or specific doc path structure handling
         // But simplest for now: Just use the collection name provided.
         // If collectionName is 'static_pages', we look in 'static_pages' collection.
         ref = doc(db, collectionName, slug);
      } else {
         ref = doc(db, collectionName, slug);
      }

      const pageDoc = await getDoc(ref);
      
      if (pageDoc.exists()) {
        return { id: pageDoc.id, ...pageDoc.data() } as PageContent;
      }
      return null;
    } catch (error) {
      console.error(`[CMS] Error fetching page "${slug}" from "${collectionName}":`, error);
      return null;
    }
  },




  async saveHistoryEntry(slug: string, data: any, collectionName = 'static_pages'): Promise<void> {
    try {
      const db = getFirebaseDb();
      const historyRef = collection(db, collectionName, slug, 'history');
      await addDoc(historyRef, {
        ...data,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving history entry:', error);
    }
  },

  async getHistoryEntries(slug: string, collectionName = 'static_pages'): Promise<any[]> {
    try {
      const db = getFirebaseDb();
      const historyRef = collection(db, collectionName, slug, 'history');
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
