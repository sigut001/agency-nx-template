import React from 'react';
import { useLoaderData, type LoaderFunctionArgs } from 'react-router';
import { PageLayout } from '../components/layout/PageLayout';

/**
 * Definition der SEO-Daten, die JEDE Seite liefern MUSS.
 * Structured Data ist hierbei ZWINGEND erforderlich.
 */
export interface PageMeta {
  title: string;
  description: string;
  structuredData: Record<string, any>;
}

/**
 * Interface für die Definition einer Seite.
 * @template LoaderData - Der Typ der Daten, die vom Loader zurückgegeben werden.
 */
export interface CreatePageConfig<LoaderData = unknown> {
  /**
   * Die UI-Komponente der Seite.
   * Erhält die Loader-Daten als Prop `data`.
   */
  component: React.FC<{ data: LoaderData }>;

  /**
   * Funktion zur Ableitung der SEO-Daten aus den Loader-Daten.
   * MUSS vorhanden sein und MUSS structuredData zurückgeben.
   */
  meta: (data: LoaderData) => PageMeta;
}

/**
 * Higher-Order Helper zur Erstellung von typsicheren Seiten mit SEO-Zwang.
 *
 * @example
 * export default createPage<MyLoaderData>({
 *   meta: (data) => ({
 *     title: data.title,
 *     description: data.desc,
 *     structuredData: { "@type": "WebPage", ... }
 *   }),
 *   component: ({ data }) => <h1>{data.title}</h1>
 * });
 */
export function createPage<LoaderData>(config: CreatePageConfig<LoaderData>) {
  return function PageWrapper() {
    // Falls kein Loader definiert ist, ist data undefined (für statische Seiten wie 404)
    const data = useLoaderData() as LoaderData;
    
    // 1. Meta-Daten berechnen (Hier knallt es, wenn Daten fehlen/falsch sind)
    const pageMeta = config.meta(data);

    // 2. UI Rendern und SEO-Daten AUTOMATISCH in das Layout injizieren
    // Wir nutzen hier PageLayout als "Zwangshülle".
    // Die innere Component rendert dann nur den Content.
    return (
      <PageLayout
        title={pageMeta.title}
        description={pageMeta.description}
        structuredData={pageMeta.structuredData}
      >
        <config.component data={data} />
      </PageLayout>
    );
  };
}
