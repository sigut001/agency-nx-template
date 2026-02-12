import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { CMSService, PageContent } from '../services/cms.service';

export const Home: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [content, setContent] = useState<PageContent | null>(null);
  const targetSlug = slug || 'home';

  useEffect(() => {
    CMSService.getPageBySlug(targetSlug).then(setContent);
  }, [targetSlug]);

  return (
    <PageLayout 
      title={content?.seo?.title || content?.title || 'Modernste Web-Entwicklung & Design'} 
      description={content?.seo?.description || 'Wir bauen Ihre digitale Zukunft mit modernsten Web-Technologien.'}
      structuredData={content?.slug === 'home' ? {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Qubits Digital",
        "url": "https://qubits-digital.de"
      } : undefined}
    >
      <section className="hero">
        <h1>{content?.title || 'Lädt...'}</h1>
        <div dangerouslySetInnerHTML={{ __html: content?.content || '' }} />
      </section>
    </PageLayout>
  );
};
