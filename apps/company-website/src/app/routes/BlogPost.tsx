
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { CMSService, PageContent } from '../services/cms.service';

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      CMSService.getPageBySlug(slug, 'blog_posts')
        .then(setPost)
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) {
    return (
      <PageLayout title="Lade Blog..." description="">
        <div className="container mx-auto px-4 py-12 text-center">
          <p>Beitrag wird geladen...</p>
        </div>
      </PageLayout>
    );
  }

  if (!post) {
    return (
      <PageLayout title="Beitrag nicht gefunden" description="">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Beitrag nicht gefunden</h1>
          <p>Der gesuchte Artikel existiert leider nicht.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title={post.seo?.title || post.title} 
      description={post.seo?.description || 'Blog Artikel'}
      structuredData={post.seo?.structuredData}
    >
      <article className="container mx-auto px-4 py-12 max-w-3xl">
        <header className="mb-8">
            <span className="text-sm text-indigo-600 font-semibold tracking-wide uppercase">Blog</span>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">{post.title}</h1>
        </header>

        <div className="prose prose-lg prose-indigo max-w-none text-slate-600">
           {/* In a real app, use a markdown renderer or sanitizer here */}
           <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </article>
    </PageLayout>
  );
};
