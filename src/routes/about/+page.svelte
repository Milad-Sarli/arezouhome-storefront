<script lang="ts">
	import { onMount } from 'svelte';
	import DOMPurify from 'dompurify';
	import Reveal from '$lib/components/Reveal.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { ApiError, api } from '$lib/api/client';
	import type { Settings } from '$lib/api/types';

	let about = $state<string>('');
	const safeAbout = $derived(DOMPurify.sanitize(about, { ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h2', 'h3', 'a', 'span', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td'] }));
	let storeName = $state('آرزو');
	let loading = $state(true);

	onMount(async () => {
		try {
			const s = await api<Settings>('/settings');
			about = s.about ?? '';
			if (s.store_name) storeName = s.store_name;
		} catch (err) {
			console.error(err instanceof ApiError ? err.message : err);
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>درباره ما | فروشگاه {storeName}</title>
</svelte:head>

<section class="relative overflow-hidden px-4 pt-10 pb-6">
	<div class="hero-wash hero-wash-a" style="width:380px;height:280px;top:-120px;left:10%"></div>
	<div class="relative mx-auto max-w-7xl">
		<Reveal>
			<h1 class="display text-3xl md:text-4xl">درباره آرزو</h1>
			<p class="mt-1 text-sm text-stone-500 dark:text-slate-400"></p>
		</Reveal>
	</div>
</section>

<section class="mx-auto max-w-3xl px-4 pb-14">
	{#if loading}
		<Skeleton class="h-40 rounded-3xl" />
	{:else if about}
		<article class="prose-fa rounded-3xl border border-stone-200/80 bg-white p-6 leading-8 text-stone-700 md:p-8 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200">
			{@html safeAbout}
		</article>
	{:else}
		<article class="prose-fa rounded-3xl border border-stone-200/80 bg-white p-6 leading-8 text-stone-700 md:p-8 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200">
			<p>فروشگاه {storeName} مرجع تخصصی لوازم خانگیه؛ از یخچال و لباسشویی تا ریزترین ابزار آشپزخونه — همه با ضمانت اصالت و گارانتی معتبر.</p>
			<p>سعی‌مون اینه خرید لوازم خونه رو از یه کار استرس‌زا تبدیل کنیم به یه تجربه راحت: قیمت شفاف به تومان، مشاوره واقعی قبل از خرید، و ارسال سالم به سراسر کشور.</p>
		</article>
	{/if}
</section>
