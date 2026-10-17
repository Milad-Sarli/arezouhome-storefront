<script lang="ts">
	import Reveal from '$lib/components/Reveal.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
import { onMount } from 'svelte';
import { ApiError, api, type ApiList } from '$lib/api/client';
	import BlogCard from '$lib/components/BlogCard.svelte';
	import type { BlogPost } from '$lib/api/types';

	let posts = $state<BlogPost[]>([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			const res = await api<ApiList<BlogPost> | BlogPost[]>('/blogs');
			posts = Array.isArray(res) ? res : res.data;
		} catch (err) {
			console.error(err instanceof ApiError ? err.message : err);
		} finally {
			loading = false;
		}
	});
</script>

<SeoHead title="بلاگ" description="راهنمای خرید لوازم خانگی، ترفندهای خونه‌داری و مقایسه کالا — بلاگ فروشگاه آرزو" image="/images/hero-real-2.webp" />

<section class="relative overflow-hidden px-4 pt-10 pb-6">
	<div class="hero-wash hero-wash-a" style="width:380px;height:280px;top:-120px;left:10%"></div>
	<div class="relative mx-auto max-w-7xl">
		<Reveal>
			<h1 class="display text-3xl md:text-4xl">بلاگ آرزو</h1>
			<p class="mt-1 text-sm text-stone-500 dark:text-slate-400">راهنمای خرید و ترفندهای خونه‌داری</p>
		</Reveal>
	</div>
</section>

<section class="mx-auto max-w-7xl px-4 pb-14">
	{#if loading}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
			{#each Array(6) as _}
				<Skeleton class="h-64 rounded-3xl" />
			{/each}
		</div>
	{:else if posts.length === 0}
		<p class="rounded-3xl border border-stone-200 bg-white p-12 text-center text-sm font-bold text-stone-600 shadow-sm dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300">
			به‌زودی اولین مطلب‌ها منتشر میشن ✍️
		</p>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
			{#each posts as p, i (p.id)}
				<BlogCard post={p} delay={i} />
			{/each}
		</div>
	{/if}
</section>
