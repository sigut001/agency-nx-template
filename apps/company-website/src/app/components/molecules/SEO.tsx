import React from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  structuredData?: Record<string, any>;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage,
  structuredData,
}) => {
  const siteName = 'Qubits Digital';
  const fullTitle = title 
    ? (title.includes(siteName) ? title : `${title} | ${siteName}`) 
    : siteName;

  return (
    <>
      <title key="title">{fullTitle}</title>
      {description && <meta name="description" content={description} key="description" />}
      {canonical && <link rel="canonical" href={canonical} key="canonical" />}

      <meta property="og:title" content={fullTitle} key="og:title" />
      {description && <meta property="og:description" content={description} key="og:description" />}
      <meta property="og:type" content={ogType} key="og:type" />
      {ogImage && <meta property="og:image" content={ogImage} key="og:image" />}
      <meta property="og:site_name" content={siteName} key="og:site_name" />

      <meta name="twitter:card" content="summary_large_image" key="twitter:card" />
      <meta name="twitter:title" content={fullTitle} key="twitter:title" />
      {description && <meta name="twitter:description" content={description} key="twitter:description" />}

      {/* JSON-LD: React 19 Safe Injection */}
      {structuredData && (
        <script
          key="json-ld"
          type="application/ld+json"
        >
          {JSON.stringify(structuredData)}
        </script>
      )}
    </>
  );
};
