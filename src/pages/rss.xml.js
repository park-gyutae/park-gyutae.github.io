import rss from '@astrojs/rss';
import { profile } from '../data/portfolio';
import { getCollection } from 'astro:content';

export async function GET(context) {
	const posts = (await getCollection('blog', ({ data }) => !data.draft))
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

	return rss({
		title: '박규태 | 프로젝트 기록',
		description: profile.description,
		site: context.site,
		items: posts.map((post) => ({
			title: post.data.title,
			pubDate: post.data.pubDate,
			description: post.data.description,
			// Compute RSS link from post.slug
			link: `/blog/${post.slug}/`,
		})),
	});
}
