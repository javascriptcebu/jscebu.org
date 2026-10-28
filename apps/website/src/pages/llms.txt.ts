import type { APIRoute } from 'astro';
import { brand, llmsTxt } from '@jscebu/brand';

export const GET: APIRoute = () =>
  new Response(llmsTxt(brand), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
