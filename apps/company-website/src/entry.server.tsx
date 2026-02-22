/**
 * ENTRY SERVER — React Router v7 Framework Mode
 *
 * Server-side entry point used for prerendering.
 * Mit ssr: false wird dieser nur zur Build-Zeit für die statische HTML-Generierung verwendet.
 */

import type { EntryContext } from 'react-router';
import { ServerRouter } from 'react-router';
import { renderToReadableStream } from 'react-dom/server';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext
) {
  const stream = await renderToReadableStream(
    <ServerRouter context={routerContext} url={request.url} />,
    {
      onError(error: unknown) {
        responseStatusCode = 500;
        console.error(error);
      },
    }
  );

  responseHeaders.set('Content-Type', 'text/html; charset=utf-8');

  return new Response(stream, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
