<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import { api } from '$lib/api/client';
	import type { Paginated, Product } from '$lib/api/types';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { wishlist } from '$lib/stores/wishlist.svelte';
	import { Heart } from 'lucide-svelte';

	let items = $state<Product[]>([]);
	let loading = $state(true);

	async function load() {
		loading = true;
		if (wishlist.ids.length === 0) {
			items = [];
			loading = false;
			return;
		}
		try {
			const res = await api<Paginated<Product>>(`/products?ids=${wishlist.ids.join(',')}`);
			items = res.data;
		} catch {
			items = [];
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		void wishlist.ids.length;
		load();
	});
</script>

<svelte:head>
	<title>علاقه‌مندی‌ها | حساب من</title>
</svelte:head>

<h1 class="display text-2xl md:text-3xl">علاقه‌مندی‌ها ❤️</h1>
<p class="mt-1 text-sm text-stone-500 dark:text-slate-400">روی همین دستگاه ذخیره میشن</p>

<div class="mt-4">
	{#if loading}
		<div class="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 xl:grid-cols-3">
			<Skeleton class="h-64 rounded-3xl" />
			<Skeleton class="h-64 rounded-3xl" />
			<Skeleton class="h-64 rounded-3xl" />
			<Skeleton class="h-64 rounded-3xl" />
		</div>
	{:else if items.length === 0}
		<div class="rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center dark:border-white/15 dark:bg-transparent">
			<Heart class="mx-auto size-10 text-stone-300 dark:text-slate-600" />
			<p class="mt-3 text-sm text-stone-500 dark:text-slate-400">هنوز چیزی رو قلب نزدی — بزن رو قلب کالاها 😉</p>
			<Button href="/products" class="mt-3 rounded-full bg-brand font-bold text-white hover:bg-brand">
				دیدن کالاها
			</Button>
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 xl:grid-cols-3">
			{#each items as p, i (p.id)}
				<ProductCard product={p} delay={i} />
			{/each}
		</div>
	{/if}
</div>
