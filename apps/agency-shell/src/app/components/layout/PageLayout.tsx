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
    <div className="app-container">
      <SEO title={title} description={description} structuredData={structuredData} />
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};
