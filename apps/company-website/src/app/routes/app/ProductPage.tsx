import { useLoaderData } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { PageLayout } from '../../components/layout/PageLayout';
import { getPageAtBuildTime } from '../../services/cms-build.service';
import type { BasePageDocument } from '../../shared/interfaces/cms.interfaces';

export async function loader({ params }: LoaderFunctionArgs) {
  const { slug } = params;
  if (!slug) throw new Response('Not Found', { status: 404 });

  const content = await getPageAtBuildTime(`dynamic_pages/produkte/documents/${slug}`);
  if (!content) throw new Response('Not Found', { status: 404 });

  return { content: content as BasePageDocument };
}

export default function ProductPage() {
  const { content } = useLoaderData<typeof loader>();

  return (
    <PageLayout
      title={content.seo?.title || content.title}
      description={content.seo?.description}
    >
      <div>
        <div className="bg-slate-50 border-b border-slate-200">
          <div className="container mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold text-slate-900">{content.title}</h1>
            <p className="text-xl text-slate-600 mt-4 max-w-2xl">{content.seo?.description}</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
            <div className="prose max-w-none text-slate-600">
              <div style={{ whiteSpace: 'pre-wrap' }}>{String(content.content)}</div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
