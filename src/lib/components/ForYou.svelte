<script lang="ts">
	import { onMount } from 'svelte';
	import ProductCard from './ProductCard.svelte';
	import { api } from '$lib/api/client';
	import { recent } from '$lib/stores/recent.svelte';
	import { cart } from '$lib/stores/cart.svelte';
	import type { Paginated, Product } from '$lib/api/types';

	let items = $state<Product[]>([]);
	let loading = $state(true);

	onMount(async () => {
		const ids = [...new Set([...recent.ids, ...cart.items.map((i) => i.productId)])].slice(0, 5);
		try {
			const [mine, fallback] = await Promise.all([
				ids.length > 0
					? api<Paginated<Product>>(`/products?ids=${ids.join(',')}`).catch(() => ({ data: [] }) as Paginated<Product>)
					: Promise.resolve({ data: [] } as Paginated<Product>),
				api<Paginated<Product>>('/products?in_stock=1&per_page=8').catch(() => ({ data: [] }) as Paginated<Product>)
			]);
			const catId = mine.data[0]?.categories?.[0]?.id;
			const pool =
				catId && mine.data.length > 0
					? (await api<Paginated<Product>>(`/products?category_id=${catId}&in_stock=1&per_page=8`).catch(() => fallback)).data
					: fallback.data;
			items = [...mine.data, ...pool.filter((p) => !ids.includes(p.id) && !mine.data.find((x) => x.id === p.id))].slice(0, 4);
		} catch {
			items = [];
		} finally {
			loading = false;
		}
	});
</script>

{#if !loading && items.length > 0}
	<section class="mx-auto max-w-7xl px-4 pb-10">
		<div class="flex items-end justify-between">
			<h2 class="display text-xl md:text-2xl">برای شما ✨</h2>
			<span class="text-xs text-stone-500 dark:text-slate-400">بر اساس بازدیدهای اخیر</span>
		</div>
		<div class="mt-4 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 md:gap-4">
			{#each items as p, i (p.id)}
				<ProductCard product={p} delay={i} />
			{/each}
		</div>
	</section>
{/if}
