import React, { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { SEO } from '../molecules/SEO';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  structuredData?: Record<string, any>;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ 
  children,
  title,
  description,
  structuredData
}) => {
  return (
    <div className="flex min-h-screen flex-col">
      <SEO title={title} description={description} structuredData={structuredData} />
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-grow px-6 py-12">
        {children}
      </main>
      <Footer />
    </div>
  );
};
