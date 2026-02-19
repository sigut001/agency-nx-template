/**
 * ENTRY SERVER — React Router v7 Framework Mode
 *
 * Server-side entry point used for prerendering.
 * Mit ssr: false wird dieser nur zur Build-Zeit für die statische HTML-Generierung verwendet.
 */

import type { EntryContext } from 'react-router';
import { ServerRouter } from 'react-router';
import { renderToString } from 'react-dom/server';

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext
) {
  const html = renderToString(
    <ServerRouter context={routerContext} url={request.url} />
  );

  responseHeaders.set('Content-Type', 'text/html');

  return new Response(`<!DOCTYPE html>${html}`, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
