import type { APIRoute } from 'astro';
import { brand, brandMd } from '@jscebu/brand';

export const GET: APIRoute = () =>
  new Response(brandMd(brand), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
