/** Runs only on asset misses: answer with the site's 404 page and a real 404 status. */
interface Env {
  ASSETS: { fetch: (input: Request | URL | string) => Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const page = await env.ASSETS.fetch(new URL('/404.html', request.url));
    return new Response(page.body, { status: 404, headers: page.headers });
  },
};
