/**
 * ENTRY CLIENT — React Router v7 Framework Mode
 *
 * Client-side entry point. Hydrates the server-rendered HTML.
 * Cookie Consent und Analytics werden in root.tsx initialisiert.
 */

import { HydratedRouter } from 'react-router/dom';
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  );
});
