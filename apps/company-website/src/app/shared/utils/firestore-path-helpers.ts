/**
 * FIRESTORE PATH HELPERS
 * 
 * Single Point of Truth for Firestore path interpretation.
 * All scripts, components, and services should use these helpers
 * instead of implementing their own path parsing logic.
 * 
 * RULES:
 * - Firestore paths must alternate: collection → doc → collection → doc
 * - Even number of segments required (e.g., 'collection/doc' or 'coll/doc/subcoll/subdoc')
 * - Empty segments not allowed
 */

import type { Firestore, DocumentReference } from 'firebase/firestore';
import { collection, doc } from 'firebase/firestore';

/**
 * Converts a Firestore path string to a DocumentReference.
 * 
 * Supports arbitrary nesting depth as long as the path follows Firestore's
 * collection → doc → collection → doc pattern.
 * 
 * @example
 * // Simple 2-segment path
 * getFirestoreDocRef(db, 'static_pages/home')
 * // → collection('static_pages').doc('home')
 * 
 * @example
 * // 4-segment nested path (current structure)
 * getFirestoreDocRef(db, 'static_pages/system/legal/impressum')
 * // → collection('static_pages').doc('system').collection('legal').doc('impressum')
 * 
 * @example
 * // 6-segment deeply nested path (future-proof)
 * getFirestoreDocRef(db, 'dynamic_pages/blog/categories/tech/posts/article-1')
 * // → collection('dynamic_pages').doc('blog').collection('categories')
 * //    .doc('tech').collection('posts').doc('article-1')
 * 
 * @param db - Firestore instance
 * @param path - Firestore document path (must have even number of segments)
 * @returns DocumentReference to the specified document
 * @throws Error if path is invalid (odd segments, empty segments, etc.)
 */
export function getFirestoreDocRef(db: Firestore, path: string): DocumentReference {
  const parts = path.split('/').filter(segment => segment.length > 0);
  
  // Validation: Must have even number of segments
  if (parts.length === 0) {
    throw new Error(
      `Invalid Firestore path: "${path}" is empty. ` +
      `Expected format: "collection/document" or "collection/document/subcollection/subdocument"`
    );
  }
  
  if (parts.length % 2 !== 0) {
    throw new Error(
      `Invalid Firestore path: "${path}" has ${parts.length} segments (odd number). ` +
      `Firestore paths must alternate collection/document pairs. ` +
      `Expected format: "collection/document" (2 segments), "coll/doc/subcoll/subdoc" (4 segments), etc.`
    );
  }
  
  // Build reference by alternating collection() and doc() calls
  let ref: any = db;
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      // Even index = collection
      ref = collection(ref, parts[i]);
    } else {
      // Odd index = document
      ref = doc(ref, parts[i]);
    }
  }
  
  return ref as DocumentReference;
}

/**
 * Extracts the document slug (last segment) from a Firestore path.
 * 
 * @example
 * getSlugFromPath('static_pages/system/legal/impressum')
 * // → 'impressum'
 * 
 * @example
 * getSlugFromPath('dynamic_pages/blog/posts/article-1')
 * // → 'article-1'
 * 
 * @param path - Firestore document path
 * @returns The last segment (document ID)
 */
export function getSlugFromPath(path: string): string {
  const parts = path.split('/').filter(segment => segment.length > 0);
  
  if (parts.length === 0) {
    throw new Error(`Cannot extract slug from empty path: "${path}"`);
  }
  
  return parts[parts.length - 1];
}

/**
 * Parses a Firestore path into collection path and document slug.
 * Useful for CMSService which expects separate collection and slug parameters.
 * 
 * @example
 * parseCollectionPath('static_pages/system/legal/impressum')
 * // → { collection: 'static_pages/system/legal', slug: 'impressum' }
 * 
 * @example
 * parseCollectionPath('static_pages/home')
 * // → { collection: 'static_pages', slug: 'home' }
 * 
 * @param path - Full Firestore document path
 * @returns Object with collection path and document slug
 */
export function parseCollectionPath(path: string): { collection: string; slug: string } {
  const parts = path.split('/').filter(segment => segment.length > 0);
  
  if (parts.length === 0) {
    throw new Error(`Cannot parse empty path: "${path}"`);
  }
  
  if (parts.length % 2 !== 0) {
    throw new Error(
      `Invalid Firestore path: "${path}" has ${parts.length} segments (odd number). ` +
      `Expected even number of segments for document path.`
    );
  }
  
  const slug = parts.pop()!;
  const collectionPath = parts.join('/');
  
  return { collection: collectionPath, slug };
}

/**
 * Validates a Firestore path without creating a reference.
 * Useful for upfront validation in configuration loading.
 * 
 * @param path - Firestore path to validate
 * @returns true if valid, throws Error if invalid
 */
export function validateFirestorePath(path: string): boolean {
  const parts = path.split('/').filter(segment => segment.length > 0);
  
  if (parts.length === 0) {
    throw new Error(`Invalid Firestore path: "${path}" is empty`);
  }
  
  if (parts.length % 2 !== 0) {
    throw new Error(
      `Invalid Firestore path: "${path}" has odd number of segments (${parts.length})`
    );
  }
  
  // Check for invalid characters in segments
  const invalidChars = /[.$#[\]\/]/;
  for (const segment of parts) {
    if (invalidChars.test(segment)) {
      throw new Error(
        `Invalid Firestore path: "${path}" contains invalid characters in segment "${segment}". ` +
        `Firestore paths cannot contain: . $ # [ ] /`
      );
    }
  }
  
  return true;
}
