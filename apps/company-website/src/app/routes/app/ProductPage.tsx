import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { PageComponent, BasePageDocument } from '../../shared/interfaces/cms.interfaces';
import { CMSService } from '../../services/cms.service';

type ProductDocument = BasePageDocument; // Type alias for future extensibility

export const ProductPage: PageComponent = ({ collection, configTitle }) => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<ProductDocument | null>(null);

  useEffect(() => {
    if (slug && collection) {
      CMSService.getPageBySlug<ProductDocument>(slug, collection)
        .then(setProduct);
    }
  }, [slug, collection]);

  return (
    <PageLayout 
      title={product?.seo?.title || product?.title || 'Produkte'} 
      description={product?.seo?.description}
    >
      <div data-hydrated={product ? "true" : "false"}>
        {product ? (
          <>
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
          </>
        ) : (
          <div style={{ display: 'none' }}>Loading...</div>
        )}
      </div>
    </PageLayout>
  );
};
