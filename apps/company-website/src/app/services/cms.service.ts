import { collection, query, getDocs, doc, getDoc, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { getFirebaseDb } from './firebase.service';
import { getFirestoreDocRef } from '../shared/utils/firestore-path-helpers';

import { BasePageDocument } from '../shared/interfaces/cms.interfaces';

// Re-export for backward compatibility if needed, or use BasePageDocument directly
export type PageContent = BasePageDocument;

export const CMSService = {
  /**
   * Fetches a page document from Firestore.
   * 
   * IMPORTANT: This function now uses the centralized firestore-path-helpers
   * to ensure consistent path interpretation across the entire application.
   * 
   * @param slug - Document ID (last segment of the path)
   * @param collectionPath - Collection path (all segments except the last one)
   * 
   * @example
   * // Static page with nested structure
   * getPageBySlug('impressum', 'static_pages/system/legal')
   * // → Fetches: collection('static_pages').doc('system').collection('legal').doc('impressum')
   * 
   * @example
   * // Dynamic page
   * getPageBySlug('doc-1', 'dynamic_pages/blog/documents')
   * // → Fetches: collection('dynamic_pages').doc('blog').collection('documents').doc('doc-1')
   */
  async getPageBySlug<T extends BasePageDocument>(slug: string, collectionPath = 'static_pages'): Promise<T | null> {
    try {
      const db = getFirebaseDb();
      
      // Construct full Firestore path by combining collection path + slug
      const fullPath = `${collectionPath}/${slug}`;
      
      // Use centralized helper to get DocumentReference
      // This ensures consistent path handling regardless of nesting depth
      const ref = getFirestoreDocRef(db as any, fullPath);
      
      const pageDoc = await getDoc(ref);
      
      if (pageDoc.exists()) {
        return { id: pageDoc.id, ...pageDoc.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`[CMS] Error fetching page "${slug}" from "${collectionPath}":`, error);
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
