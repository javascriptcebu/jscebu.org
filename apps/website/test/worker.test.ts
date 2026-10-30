import { expect, it, vi } from 'vitest';
import worker from '../worker/index.ts';

it('fetches the canonical 404 on the request origin and preserves its body and headers', async () => {
  const fetch = vi.fn(async (input: Request | URL | string) => {
    expect(String(input)).toBe('https://preview.example/404');
    return new Response('Missing page', { headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Test': 'kept' } });
  });
  const response = await worker.fetch(new Request('https://preview.example/missing'), { ASSETS: { fetch } });
  expect(fetch).toHaveBeenCalledOnce();
  expect(response.status).toBe(404);
  expect(await response.text()).toBe('Missing page');
  expect(response.headers.get('x-test')).toBe('kept');
  expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8');
});
