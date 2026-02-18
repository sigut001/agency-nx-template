import { useState, useEffect } from 'react';
import { PageLayout } from '../../../components/layout/PageLayout';
import { PageComponent, BasePageDocument } from '../../../shared/interfaces/cms.interfaces';
import { CMSService } from '../../../services/cms.service';
import { parseCollectionPath } from '../../../shared/utils/firestore-path-helpers';

export const LegalPage: PageComponent = ({ collection, configTitle }) => {
  const [content, setContent] = useState<BasePageDocument | null>(null);

  useEffect(() => {
    if (collection) {
      const { collection: colPath, slug } = parseCollectionPath(collection);
      CMSService.getPageBySlug<BasePageDocument>(slug, colPath).then(setContent);
    }
  }, [collection]);


  return (
    <PageLayout 
      title={content?.seo?.title || content?.title || configTitle || 'Rechtliches'}
      description={content?.seo?.description || 'Rechtliche Informationen'}
    >
      <section className="legal" data-hydrated={content ? "true" : "false"}>
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
