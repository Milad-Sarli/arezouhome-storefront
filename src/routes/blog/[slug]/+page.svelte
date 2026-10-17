<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import DOMPurify from 'dompurify';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { ApiError, api } from '$lib/api/client';
	import { fileUrl, srcSet } from '$lib/api/files';
	import type { BlogPost } from '$lib/api/types';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { breadcrumbJsonLd, stripHtml } from '$lib/seo/seo';
	import { jalaliLong } from '$lib/format/jalali';

	const slug = $derived(page.params.slug);

	let post = $state<BlogPost | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			post = await api<BlogPost>(`/blogs/${slug}`);
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'مطلب پیدا نشد.';
		} finally {
			loading = false;
		}
	});
	const headJsonLd = $derived.by(() => {
		if (!post) return [];
		const origin = page.url.origin;
		return [
			{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: post.title,
				image: post.image ? [fileUrl(post.image)] : [],
				datePublished: post.publish_at,
				author: { '@type': 'Organization', name: 'فروشگاه آرزو' },
				inLanguage: 'fa-IR'
			},
			breadcrumbJsonLd(origin, [
				{ name: 'خانه', path: '/' },
				{ name: 'بلاگ', path: '/blog' },
				{ name: post.title, path: `/blog/${slug}` }
			])
		];
	});
</script>

{#if post}
	<SeoHead
		title={post.meta_title || post.title}
		description={post.meta_description || stripHtml(post.excerpt || post.description)}
		image={post.image}
		canonical={post.canonical_url}
		type="article"
		jsonLd={headJsonLd}
	/>
{:else}
	<SeoHead title="بلاگ" description="بلاگ فروشگاه آرزو — راهنمای خرید لوازم خانگی" />
{/if}

<section class="mx-auto max-w-3xl px-4 py-10">
	{#if loading}
		<div class="flex flex-col gap-3">
			<Skeleton class="h-8 w-3/4 rounded-xl" />
			<Skeleton class="h-4 w-32 rounded-full" />
			<Skeleton class="h-64 rounded-3xl" />
			<Skeleton class="h-24 rounded-2xl" />
		</div>
	{:else if error || !post}
		<p class="text-sm font-bold text-red-600">{error ?? 'مطلب پیدا نشد.'}</p>
	{:else}
		{#if post.category}
			<span class="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand-dark dark:text-brand">{post.category}</span>
		{/if}
		<h1 class="display mt-3 text-3xl leading-12 text-stone-900 md:text-4xl dark:text-white">{post.title}</h1>
		<p class="mt-2 flex items-center gap-2 text-xs text-stone-400 dark:text-slate-500">
			<span>{jalaliLong(post.publish_at)}</span>
			<span>•</span>
			<span>{post.reading_minutes} دقیقه مطالعه</span>
			{#if post.views > 0}
				<span>•</span>
				<span>{post.views.toLocaleString('fa-IR')} بازدید</span>
			{/if}
		</p>
		{#if post.excerpt}
			<p class="mt-3 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-7 text-stone-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">{post.excerpt}</p>
		{/if}
		{#if fileUrl(post.image)}
			<img src={fileUrl(post.image)} srcset={srcSet(post.image, [640, 960]) ?? undefined} sizes="(max-width: 768px) 100vw, 768px" alt={post.title} width="960" height="540" loading="lazy" decoding="async" fetchpriority="low" class="mt-6 w-full rounded-3xl border border-stone-200/70 object-cover dark:border-white/10" />
		{/if}
		<article class="prose-fa mt-6 leading-8 text-stone-700 dark:text-slate-200">
			{@html DOMPurify.sanitize(post.description ?? '', { ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h2', 'h3', 'a', 'span', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td'] })}
		</article>
		<a href="/blog" class="mt-8 inline-block rounded-full border border-stone-300 px-5 py-2 text-xs font-bold hover:border-brand hover:text-brand-dark dark:border-white/15 dark:hover:text-brand">
			→ برگشت به بلاگ
		</a>
	{/if}
</section>
