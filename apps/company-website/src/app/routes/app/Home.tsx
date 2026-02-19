import { useLoaderData } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { PageLayout } from '../../components/layout/PageLayout';
import { getPageAtBuildTime } from '../../services/cms-build.service';
import type { BasePageDocument } from '../../shared/interfaces/cms.interfaces';

export async function loader(_: LoaderFunctionArgs) {
  const content = await getPageAtBuildTime('static_pages/app/marketing/home');
  return { content: content as BasePageDocument | null };
}

export default function Home() {
  const { content } = useLoaderData<typeof loader>();

  return (
    <PageLayout
      title={content?.seo?.title || content?.title}
      description={content?.seo?.description}
    >
      <section className="hero">
        {content && (
          <>
            <h1>{content.title}</h1>
            <div style={{ whiteSpace: 'pre-wrap' }}>{String(content.content)}</div>
          </>
        )}
      </section>
    </PageLayout>
  );
}
