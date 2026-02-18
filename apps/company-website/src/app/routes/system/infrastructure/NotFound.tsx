import React from 'react';
import { PageLayout } from '../../../components/layout/PageLayout';

export const NotFound: React.FC = () => {
  return (
    <PageLayout>
      <section className="not-found" data-hydrated="true">
        <h1>404 - Seite nicht gefunden</h1>
        <p>Leider konnten wir die gewünschte Seite nicht finden.</p>
        <a href="/">Zurück zur Startseite</a>
      </section>
    </PageLayout>
  );
};
