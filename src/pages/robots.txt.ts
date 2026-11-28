import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => new Response(
  `User-agent: *
Allow: /

User-agent: GPTBot
User-agent: ClaudeBot
Disallow: /

Sitemap: ${new URL('/sitemap.xml', site).href}
`,
  { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
);
