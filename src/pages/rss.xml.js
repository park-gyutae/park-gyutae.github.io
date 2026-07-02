import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
	const posts = (await getCollection('blog', ({ data }) => !data.draft))
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

	return rss({
		title: 'DevLog | Technical Blog',
		description: "A professional developer's technical blog for sharing insights, projects, and tutorials.",
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
