<script lang="ts">
	import { fileUrl, srcSetFromVariants } from '$lib/api/files';
	import type { ImageVariant } from '$lib/api/types';

	let {
		src,
		alt,
		variants = null,
		widths = [320, 640, 960],
		sizes = '(max-width: 640px) 50vw, 400px',
		eager = false,
		width,
		height,
		imgClass = ''
	}: {
		src: string | null | undefined;
		alt: string;
		variants?: ImageVariant[] | null;
		widths?: number[];
		sizes?: string;
		eager?: boolean;
		width?: number | string;
		height?: number | string;
		imgClass?: string;
	} = $props();

	const fallback = $derived(fileUrl(src));
	const set = $derived(srcSetFromVariants(variants, src, widths));
	const main = $derived.by(() => {
		if (variants && variants.length > 0) {
			const sorted = [...variants].sort((a, b) => a.width - b.width);
			return (sorted.find((v) => v.width >= 640) ?? sorted[sorted.length - 1]).url;
		}
		return fallback;
	});
</script>

{#if main}
	<img
		src={main}
		srcset={set ?? undefined}
		{sizes}
		{alt}
		loading={eager ? 'eager' : 'lazy'}
		decoding="async"
		fetchpriority={eager ? 'high' : 'low'}
		{width}
		{height}
		class={imgClass}
		onerror={(e) => {
			const t = e.currentTarget;
			if (fallback && t.src !== fallback) {
				t.removeAttribute('srcset');
				t.src = fallback;
			}
		}}
	/>
{/if}
