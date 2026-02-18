import { useEffect, useState } from 'react';
import { PageComponent, BasePageDocument } from '../../shared/interfaces/cms.interfaces';
import { CMSService } from '../../services/cms.service';
import { PageLayout } from '../../components/layout/PageLayout';
import { parseCollectionPath } from '../../shared/utils/firestore-path-helpers';

export const Home: PageComponent = ({ collection, configTitle }) => {
  const [content, setContent] = useState<BasePageDocument | null>(null);
  
  useEffect(() => {
    if (collection) {
      const { collection: colPath, slug } = parseCollectionPath(collection);
      CMSService.getPageBySlug<BasePageDocument>(slug, colPath).then(setContent);
    }
  }, [collection]);


  return (
    <PageLayout 
      title={content?.seo?.title || content?.title || configTitle || 'Modernste Web-Entwicklung & Design'} 
      description={content?.seo?.description || 'Wir bauen Ihre digitale Zukunft'} 
      structuredData={content?.slug === 'home' ? {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Qubits Digital",
        "url": "https://qubits-digital.de"
      } : undefined}
    >
      <section className="hero" data-hydrated={content ? "true" : "false"}>
        {content ? (
          <>
            <h1>{content.title}</h1>
            <div dangerouslySetInnerHTML={{ __html: content.content }} />
          </>
        ) : (
          <div style={{ display: 'none' }}>Loading...</div>
        )}
      </section>
    </PageLayout>
  );
};
