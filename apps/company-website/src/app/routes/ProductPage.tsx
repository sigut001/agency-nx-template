
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { CMSService, PageContent } from '../services/cms.service';

export const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      CMSService.getPageBySlug(slug, 'products')
        .then(setProduct)
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) {
    return (
      <PageLayout title="Lade Produkt..." description="">
        <div className="container mx-auto px-4 py-12 text-center">
          <p>Produkt wird geladen...</p>
        </div>
      </PageLayout>
    );
  }

  if (!product) {
    return (
      <PageLayout title="Produkt nicht gefunden" description="">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Produkt nicht gefunden</h1>
          <p>Das gesuchte Produkt existiert leider nicht.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title={product.seo?.title || product.title} 
      description={product.seo?.description || 'Unsere Produkte'}
    >
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="container mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold text-slate-900">{product.title}</h1>
            <p className="text-xl text-slate-600 mt-4 max-w-2xl">{product.seo?.description}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
            <div className="prose max-w-none text-slate-600">
                <div dangerouslySetInnerHTML={{ __html: product.content }} />
            </div>
        </div>
      </div>
    </PageLayout>
  );
};
