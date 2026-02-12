import React from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { ContactForm } from '../components/molecules/ContactForm';

export const Contact: React.FC = () => {
  return (
    <PageLayout>
      <section className="contact">
        <h1>Kontakt</h1>
        <p>Haben Sie ein Projekt im Kopf? Lassen Sie uns darüber sprechen.</p>
        <ContactForm />
      </section>
    </PageLayout>
  );
};
