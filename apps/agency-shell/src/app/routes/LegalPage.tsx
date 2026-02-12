import React from 'react';
import { PageLayout } from '../components/layout/PageLayout';

interface LegalPageProps {
  title: string;
}

export const LegalPage: React.FC<LegalPageProps> = ({ title }) => {
  return (
    <PageLayout>
      <section className="legal">
        <h1>{title}</h1>
        <p>Hier stehen die rechtlichen Informationen für {title}.</p>
        <div className="placeholder-content">
          [Platzhalter für den rechtlichen Text]
        </div>
      </section>
    </PageLayout>
  );
};
