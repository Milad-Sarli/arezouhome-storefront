import { PUBLIC_API_URL } from '$env/static/public';

export async function GET({ url, fetch }: { url: URL; fetch: typeof fetch }): Promise<Response> {
	const origin = url.origin;
	const lines: string[] = [
		`# ${origin} — فروشگاه اینترنتی لوازم خانگی آرزو`,
		'',
		'> خرید یخچال، لباسشویی، ظرفشویی، سشوار، قابلمه — گارانتی شرکتی، قیمت شفاف به تومان، ارسال سراسر کشور.',
		'',
		'## صفحات اصلی',
		`- ${origin}/ — خانه + دسته‌بندی + شگفت‌انگیز`,
		`- ${origin}/products — ویترین کالا (فیلتر برند/دسته/قیمت)`,
		`- ${origin}/products/{slug} — جزئیات کالا + قیمت تومان + موجودی + AR`,
		`- ${origin}/amazings — تخفیف شگفت‌انگیز`,
		`- ${origin}/blog — بلاگ لوازم خانگی`,
		`- ${origin}/about — درباره ما`,
		`- ${origin}/contact — تماس`,
		`- ${origin}/track — پیگیری سفارش`,
		'',
		'## API (برای ایجنت‌ها)'
	];

	try {
		const res = await fetch(`${PUBLIC_API_URL}/products?per_page=5`);
		if (res.ok) {
			const json = await res.json();
			const items: { slug: string; name: string }[] = json.data ?? [];
			for (const p of items.slice(0, 5)) {
				lines.push(`- ${origin}/products/${p.slug} — ${p.name}`);
			}
		}
	} catch {
		/* offline — static list only */
	}

	lines.push(
		`- ${origin.replace(':5173', '.test')}/api/v1/products — JSON لیست کالا`,
		`- ${origin.replace(':5173', '.test')}/api/v1/products/{slug} — JSON جزئیات + ar_model_url + image_variants`,
		`- sitemap: ${origin}/sitemap.xml`,
		`- robots: ${origin}/robots.txt`,
		`- ai: ${origin}/ai.txt`,
		'',
		'## قوانین',
		'- پول: ریال در DB، نمایش تومان (toman)',
		'- تاریخ: شمسی (جلالی) برای نمایش',
		'- زبان: fa-IR, dir=rtl',
		''
	);

	return new Response(lines.join('\n'), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
	});
}
