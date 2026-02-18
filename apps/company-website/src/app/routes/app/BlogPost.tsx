import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { PageComponent, BasePageDocument } from '../../shared/interfaces/cms.interfaces';
import { CMSService } from '../../services/cms.service';

type BlogDocument = BasePageDocument;

export const BlogPost: PageComponent = ({ collection, configTitle }) => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogDocument | null>(null);

  useEffect(() => {
    if (slug && collection) {
      CMSService.getPageBySlug<BlogDocument>(slug, collection)
        .then(setPost);
    }
  }, [slug, collection]);

  return (
    <PageLayout 
      title={post?.seo?.title || post?.title || 'Blog'} 
      description={post?.seo?.description}
      structuredData={post?.seo?.structuredData}
    >
      <article className="container mx-auto px-4 py-12 max-w-3xl" data-hydrated={post ? "true" : "false"}>
        {post ? (
          <>
            <header className="mb-8">
                <span className="text-sm text-indigo-600 font-semibold tracking-wide uppercase">Blog</span>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">{post.title}</h1>
            </header>

            <div className="prose prose-lg prose-indigo max-w-none text-slate-600">
               <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
          </>
        ) : (
          <div style={{ display: 'none' }}>Loading...</div>
        )}
      </article>
    </PageLayout>
  );
};
