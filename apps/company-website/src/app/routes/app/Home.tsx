import { type LoaderFunctionArgs } from 'react-router';
import { getPageAtBuildTime } from '../../services/cms-build.service';
import type { BasePageDocument } from '../../shared/interfaces/cms.interfaces';
import { createPage } from '../../core/createPage';

export async function loader(_: LoaderFunctionArgs) {
  const content = await getPageAtBuildTime('static_pages/app/marketing/home');
  return { content: content as BasePageDocument | null };
}

export default createPage<Awaited<ReturnType<typeof loader>>>({
  meta: ({ content }) => ({
    title: content?.seo?.title || content?.title || 'Home',
    description: content?.seo?.description || '',
    structuredData: content?.seo?.structuredData || {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Home Fallback" // Fallback should ideally not happen if seeding is correct
    }
  }),
  component: ({ data: { content } }) => {
    return (
      <section className="hero bg-secondary/10 p-8 rounded-xl dark:bg-slate-800/50">
        {content && (
          <>
            <h1 className="text-4xl font-bold text-primary mb-4">{content.title}</h1>
            <div className="whitespace-pre-wrap text-lg opacity-90">{String(content.content)}</div>
          </>
        )}
      </section>
    );
  }
});
