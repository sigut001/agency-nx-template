import { FC } from 'react';

// --- 1. Firestore Data Schema ---

export interface BasePageDocument {
  id: string;      // Firebase ID
  slug: string;    // URL-Slug (Pflicht!)
  title: string;   // H1 / Meta-Title Basis
  content: string; // HTML oder Structured Content
  
  // SEO ist Pflicht, um "vergessene" Metadaten zu verhindern
  seo: {
    title: string;
    description: string;
    keywords?: string;
    ogImage?: string;
    structuredData?: Record<string, any>;
  };

  // Metadaten
  updatedAt?: any; // Firestore Timestamp
  createdAt?: any;
  [key: string]: any; // Allow extensibility
}

// Spezifische Typen können erben:
export interface ProductDocument extends BasePageDocument {
  price: number;
  currency: string;
}

// --- 2. Component Props ---

export interface CmsPageProps {
  /**
   * Der Pfad zum Dokument in Firestore.
   * - Static: "static_pages/home"
   * - Dynamic: "dynamic_pages/blog/documents" (plus slug aus URL)
   */
  collection: string; 
  
  /**
   * Statischer Titel aus der Config (Fallback/Context)
   */
  configTitle?: string;
}

// --- 3. Component Type Contract ---

/**
 * Jede Seite, die im Router verwendet wird, MUSS diesen Typ implementieren.
 * Sie erhält 'collection' und 'configTitle' aus der Route-Config.
 */
export type PageComponent = FC<CmsPageProps>;
