import type { APIRoute } from 'astro';
import { brand, tokensCss } from '@jscebu/brand';

export const GET: APIRoute = () =>
  new Response(tokensCss(brand), { headers: { 'Content-Type': 'text/css; charset=utf-8' } });
