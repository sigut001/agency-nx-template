import { useLoaderData } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { PageLayout } from '../../components/layout/PageLayout';
import { getPageAtBuildTime } from '../../services/cms-build.service';
import type { BasePageDocument } from '../../shared/interfaces/cms.interfaces';

export async function loader({ params }: LoaderFunctionArgs) {
  const { slug } = params;
  if (!slug) throw new Response('Not Found', { status: 404 });

  const content = await getPageAtBuildTime(`dynamic_pages/blog/documents/${slug}`);
  if (!content) throw new Response('Not Found', { status: 404 });

  return { content: content as BasePageDocument };
}

export default function BlogPost() {
  const { content } = useLoaderData<typeof loader>();

  return (
    <PageLayout
      title={content.seo?.title || content.title}
      description={content.seo?.description}
      structuredData={content.seo?.structuredData}
    >
      <article className="container mx-auto px-4 py-12 max-w-3xl">
        <header className="mb-8">
          <span className="text-sm text-indigo-600 font-semibold tracking-wide uppercase">Blog</span>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">{content.title}</h1>
        </header>

        <div className="prose prose-lg prose-indigo max-w-none text-slate-600">
          <div style={{ whiteSpace: 'pre-wrap' }}>{String(content.content)}</div>
        </div>
      </article>
    </PageLayout>
  );
}
