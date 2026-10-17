<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import ProductCard from './ProductCard.svelte';
	import { faDigits } from '$lib/format/money';
	import type { Amazing } from '$lib/api/types';

	let { amazing, delay = 0 }: { amazing: Amazing; delay?: number } = $props();

	const product = $derived(
		amazing.price_rial
			? {
					...amazing.product,
					final_price_rial: amazing.price_rial,
					discount_rial: Math.max(0, amazing.product.price_rial - amazing.price_rial)
				}
			: amazing.product
	);

	let now = $state(Date.now());
	let timer: ReturnType<typeof setInterval> | null = null;

	onMount(() => {
		timer = setInterval(() => (now = Date.now()), 1000);
	});
	onDestroy(() => {
		if (timer) clearInterval(timer);
	});

	const remain = $derived.by(() => {
		if (!amazing.end_at) return null;
		const ms = new Date(amazing.end_at).getTime() - now;
		if (ms <= 0) return null;
		const s = Math.floor(ms / 1000);
		return {
			d: Math.floor(s / 86400),
			h: Math.floor((s % 86400) / 3600),
			m: Math.floor((s % 3600) / 60),
			s: s % 60
		};
	});

	const parts = $derived(
		remain
			? [
					{ v: remain.s, l: 'ثانیه' },
					{ v: remain.m, l: 'دقیقه' },
					{ v: remain.h, l: 'ساعت' },
					{ v: remain.d, l: 'روز' }
				]
			: []
	);
</script>

<div class="flex h-full flex-col">
	<div class="flex-1">
		<ProductCard product={product} delay={delay} />
	</div>
	{#if remain}
		<div class="tick mt-2 flex items-center justify-center gap-1.5 rounded-2xl border border-red-200 bg-red-50 px-2 py-2 dark:border-red-500/25 dark:bg-red-500/10" dir="rtl">
			<span class="text-[11px] font-black text-red-600 dark:text-red-400">پایان جشنواره:</span>
			{#each parts as p}
				<span class="flex flex-col items-center rounded-lg bg-white px-1.5 py-0.5 shadow-sm dark:bg-white/10">
					<span class="text-sm leading-5 font-black text-stone-900 dark:text-white">{faDigits(String(p.v).padStart(2, '0'))}</span>
					<span class="text-[9px] text-stone-500 dark:text-slate-400">{p.l}</span>
				</span>
			{/each}
		</div>
	{/if}
</div>
