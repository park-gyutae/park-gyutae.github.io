import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

const pageFiles = import.meta.glob('/src/pages/**/*.{astro,md,mdx}');
const escapeXML = (value: string) => value.replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!);

export const GET: APIRoute = async ({ site }) => {
  const staticPaths = Object.keys(pageFiles)
    .filter(path => !path.includes('[') && !/\/(404|500)\./.test(path))
    .map(path => path.replace('/src/pages', '').replace(/\.(astro|md|mdx)$/, '').replace(/\/index$/, '/') )
    .map(path => path.endsWith('/') ? path : `${path}/`);
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const entries = [
    ...staticPaths.map(path => `<url><loc>${escapeXML(new URL(path, site).href)}</loc></url>`),
    ...posts.map(post => `<url><loc>${escapeXML(new URL(`/blog/${post.slug}/`, site).href)}</loc><lastmod>${(post.data.updatedDate || post.data.pubDate).toISOString()}</lastmod></url>`),
  ];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
