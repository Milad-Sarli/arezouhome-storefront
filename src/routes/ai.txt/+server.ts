export async function GET({ url }: { url: URL }): Promise<Response> {
	const origin = url.origin;
	const body = {
		name: 'Arezou Home — Iranian home appliances store (fa-IR, RTL)',
		site: origin,
		language: 'fa-IR',
		currency_display: 'Toman (تومان); database stores Rial integers (*_rial)',
		date_display: 'Jalali (Shamsi) calendar',
		pages: {
			home: `${origin}/`,
			products: `${origin}/products`,
			product_detail: `${origin}/products/{slug}`,
			amazings: `${origin}/amazings`,
			blog: `${origin}/blog`,
			track_order: `${origin}/track`
		},
		api: {
			products: `${origin.replace(':5173', '.test')}/api/v1/products`,
			product_detail: `${origin.replace(':5173', '.test')}/api/v1/products/{slug}`
		},
		discovery: {
			sitemap: `${origin}/sitemap.xml`,
			robots: `${origin}/robots.txt`,
			llms: `${origin}/llms.txt`
		}
	};

	return new Response(JSON.stringify(body, null, 2), {
		headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
	});
}
