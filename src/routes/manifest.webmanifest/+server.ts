export async function GET(): Promise<Response> {
	const body = {
		name: 'فروشگاه آرزو — لوازم خانگی',
		short_name: 'آرزو',
		description: 'خرید یخچال، لباسشویی، ظرفشویی و لوازم آشپزخانه با گارانتی شرکتی',
		start_url: '/',
		display: 'standalone',
		dir: 'rtl',
		lang: 'fa-IR',
		background_color: '#faf8f4',
		theme_color: '#faf8f4',
		icons: [
			{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
			{ src: '/images/hero-product.webp', sizes: '512x512', type: 'image/webp', purpose: 'any' }
		]
	};

	return new Response(JSON.stringify(body), {
		headers: { 'Content-Type': 'application/manifest+json; charset=utf-8', 'Cache-Control': 'public, max-age=86400' }
	});
}
