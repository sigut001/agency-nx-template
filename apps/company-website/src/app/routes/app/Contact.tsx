import { useLoaderData, type LoaderFunctionArgs } from 'react-router';
import { getPageAtBuildTime } from '../../services/cms-build.service';
import { createPage } from '../../core/createPage';
import type { BasePageDocument } from '../../shared/interfaces/cms.interfaces';
import { HubspotContactForm } from '../../components/molecules/HubspotContactForm';
import { HubspotNewsletterForm } from '../../components/molecules/HubspotNewsletterForm';

export async function loader(_: LoaderFunctionArgs) {
  const content = await getPageAtBuildTime('static_pages/app/marketing/kontakt');
  return { content: content as BasePageDocument | null };
}

export default createPage<Awaited<ReturnType<typeof loader>>>({
  meta: ({ content }) => ({
    title: content?.seo?.title || content?.title || 'Kontakt',
    description: content?.seo?.description || 'Kontaktieren Sie uns.',
    structuredData: content?.seo?.structuredData || {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Kontakt"
    }
  }),
  component: ({ data: { content } }) => {
    return (
      <section className="contact">
        {content && (
          <>
            <h1>{content.title}</h1>
            <div style={{ whiteSpace: 'pre-wrap' }}>{String(content.content)}</div>
          </>
        )}
        <HubspotContactForm />
        <hr style={{ margin: '40px 0' }} />
        <h2>Newsletter Abonnieren</h2>
        <HubspotNewsletterForm />
      </section>

    );
  }
});
