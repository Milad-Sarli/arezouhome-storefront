<script lang="ts">
	import { page } from '$app/state';
	import { fileUrl } from '$lib/api/files';

	let {
		title,
		description,
		image = null,
		canonical = null,
		type = 'website',
		noindex = false,
		jsonLd = []
	}: {
		title: string;
		description: string;
		image?: string | null;
		canonical?: string | null;
		type?: 'website' | 'product' | 'article';
		noindex?: boolean;
		jsonLd?: Record<string, unknown>[];
	} = $props();

	const url = $derived(page.url);
	const canonicalUrl = $derived(canonical || `${url.origin}${url.pathname}`);
	const absImage = $derived.by(() => {
		if (!image) return `${url.origin}/images/hero-real-1.webp`;
		const u = fileUrl(image) ?? image;
		return u.startsWith('/') ? `${url.origin}${u}` : u;
	});
	const fullTitle = $derived(`${title} | فروشگاه آرزو`);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<meta name="robots" content={noindex ? 'noindex, follow' : 'index, follow'} />
	<link rel="canonical" href={canonicalUrl} />
	<meta property="og:site_name" content="فروشگاه آرزو" />
	<meta property="og:locale" content="fa_IR" />
	<meta property="og:type" content={type === 'product' ? 'product' : type === 'article' ? 'article' : 'website'} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content={absImage} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={absImage} />
	{#each jsonLd as schema, i (i)}
		{@html `<script type="application/ld+json">${JSON.stringify(schema)}</scr` + `ipt>`}
	{/each}
</svelte:head>
