<script lang="ts">
	import Reveal from '$lib/components/Reveal.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
import { onMount } from 'svelte';
	import AmazingCard from '$lib/components/AmazingCard.svelte';
import { ApiError, api } from '$lib/api/client';
	import type { Amazing } from '$lib/api/types';

	let items = $state<Amazing[]>([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			items = await api<Amazing[]>('/amazings');
		} catch (err) {
			console.error(err instanceof ApiError ? err.message : err);
		} finally {
			loading = false;
		}
	});
</script>

<SeoHead title="شگفت‌انگیزها" description="تخفیف‌های محدود و جشنواره فروش لوازم خانگی — تا تموم نشده بجنب!" image="/images/hero-real-3.webp" />

<section class="relative overflow-hidden px-4 pt-10 pb-6">
	<div class="hero-wash hero-wash-a" style="width:380px;height:280px;top:-120px;left:10%"></div>
	<div class="relative mx-auto max-w-7xl">
		<Reveal>
			<h1 class="display text-3xl md:text-4xl">شگفت‌انگیزها</h1>
			<p class="mt-1 text-sm text-stone-500 dark:text-slate-400">تخفیف‌های محدود — تا تموم نشده بجنب!</p>
		</Reveal>
	</div>
</section>

<section class="mx-auto max-w-7xl px-4 pb-14">
	{#if loading}
		<div class="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 md:grid-cols-4">
			{#each Array(8) as _}
				<Skeleton class="h-72 rounded-3xl" />
			{/each}
		</div>
	{:else if items.length === 0}
		<div class="rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center dark:border-white/15 dark:bg-transparent">
			<p class="text-sm text-stone-500 dark:text-slate-400">فعلا جشنواره‌ای فعال نیست — سر بزن به ویترین 😉</p>
			<a href="/products" class="mt-3 inline-block rounded-full border border-brand/60 px-5 py-2 text-xs font-bold text-brand">
				دیدن همه کالاها
			</a>
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 md:grid-cols-4">
			{#each items as a, i (a.id)}
				<AmazingCard amazing={a} delay={i} />
			{/each}
		</div>
	{/if}
</section>
