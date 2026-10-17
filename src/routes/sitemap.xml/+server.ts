import { PUBLIC_API_URL, PUBLIC_FILES_URL } from '$env/static/public';

interface Row {
	slug: string;
	updated_at?: string | null;
	image?: string | null;
}

interface UrlEntry {
	loc: string;
	lastmod: string;
	changefreq: string;
	priority: string;
	image?: string;
}

/** Sitemap of static pages + categories + all products + blog posts (with images). */
export async function GET({ url, fetch }: { url: URL; fetch: typeof fetch }): Promise<Response> {
	const origin = url.origin;
	const today = new Date().toISOString().split('T')[0];
	const urls: UrlEntry[] = [
		{ loc: '', lastmod: today, changefreq: 'daily', priority: '1.0' },
		{ loc: '/products', lastmod: today, changefreq: 'daily', priority: '0.9' },
		{ loc: '/amazings', lastmod: today, changefreq: 'daily', priority: '0.8' },
		{ loc: '/blog', lastmod: today, changefreq: 'daily', priority: '0.7' },
		{ loc: '/contact', lastmod: today, changefreq: 'monthly', priority: '0.5' },
		{ loc: '/about', lastmod: today, changefreq: 'monthly', priority: '0.5' },
		{ loc: '/warranty', lastmod: today, changefreq: 'monthly', priority: '0.5' }
	];

	async function collect(
		path: string,
		prefix: string,
		opts: { changefreq: string; priority: string; withImage: boolean }
	) {
		let page = 1;
		for (let i = 0; i < 25; i++) {
			const res = await fetch(`${PUBLIC_API_URL}${path}?page=${page}`);
			if (!res.ok) break;
			const json = await res.json();
			const rows: Row[] = json.data ?? [];
			if (rows.length === 0) break;
			for (const r of rows) {
				if (!r.slug) continue;
				let image: string | undefined;
				if (opts.withImage && r.image) {
					image = r.image.startsWith('http') || r.image.startsWith('/')
						? r.image
						: `${PUBLIC_FILES_URL}/${r.image}`;
				}
				urls.push({
					loc: `${prefix}${r.slug}`,
					lastmod: (r.updated_at ?? '').split('T')[0] || today,
					changefreq: opts.changefreq,
					priority: opts.priority,
					image
				});
			}
			if (page >= (json.meta?.last_page ?? 1)) break;
			page += 1;
		}
	}

	// categories (id-based listing pages)
	try {
		const res = await fetch(`${PUBLIC_API_URL}/categories`);
		if (res.ok) {
			const json = await res.json();
			const cats: { id: number }[] = json.data ?? [];
			for (const c of cats) {
				urls.push({
					loc: `/products?category_id=${c.id}`,
					lastmod: today,
					changefreq: 'weekly',
					priority: '0.6'
				});
			}
		}
	} catch {
		/* ignore */
	}

	await collect('/products', '/products/', { changefreq: 'weekly', priority: '0.8', withImage: true });
	await collect('/blogs', '/blog/', { changefreq: 'weekly', priority: '0.6', withImage: true });

	const esc = (s: string) =>
		s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

	const body =
		`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
		urls
			.map(
				(u) =>
					`  <url><loc>${origin}${esc(u.loc)}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority>` +
					(u.image ? `<image:image><image:loc>${esc(u.image)}</image:loc></image:image>` : '') +
					`</url>`
			)
			.join('\n') +
		`\n</urlset>\n`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
}
