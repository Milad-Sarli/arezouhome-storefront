<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import Reveal from '$lib/components/Reveal.svelte';
	import { api } from '$lib/api/client';
	import { fileUrl } from '$lib/api/files';
	import type { Paginated, Product } from '$lib/api/types';
	import { compare } from '$lib/stores/compare.svelte';
	import { toman } from '$lib/format/money';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { Scale, X, Trash2 } from 'lucide-svelte';

	let items = $state<Product[]>([]);
	let loading = $state(true);

	async function load() {
		loading = true;
		if (compare.ids.length === 0) {
			items = [];
			loading = false;
			return;
		}
		try {
			const res = await api<Paginated<Product>>(`/products?ids=${compare.ids.join(',')}`);
			const map = new Map(res.data.map((p) => [p.id, p]));
			items = compare.ids.map((id) => map.get(id)).filter(Boolean) as Product[];
		} catch {
			items = [];
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		void compare.ids.length;
		load();
	});

	const rows = $derived([
		{ label: 'برند', get: (p: Product) => p.brand?.name ?? '—' },
		{ label: 'قیمت', get: (p: Product) => toman(p.final_price_rial) },
		{ label: 'تخفیف', get: (p: Product) => (p.discount_rial > 0 ? toman(p.discount_rial) : '—') },
		{ label: 'موجودی', get: (p: Product) => (p.in_stock && p.quantity > 0 ? `${p.quantity} عدد` : 'ناموجود') },
		{ label: 'گارانتی', get: (p: Product) => p.warranty?.title ?? '—' }
	]);
</script>

<svelte:head>
	<title>مقایسه | فروشگاه آرزو</title>
</svelte:head>

<section class="relative overflow-hidden px-4 pt-10 pb-6">
	<div class="hero-wash hero-wash-a" style="width:380px;height:280px;top:-120px;left:10%"></div>
	<div class="relative mx-auto max-w-7xl">
		<Reveal>
			<h1 class="display text-3xl md:text-4xl">مقایسه کالاها</h1>
			<p class="mt-1 text-sm text-stone-500 dark:text-slate-400">حداکثر ۴ کالا</p>
		</Reveal>
	</div>
</section>

<section class="mx-auto max-w-7xl px-4 pb-14">
	{#if loading}
		<div class="flex flex-col gap-3">
			<Skeleton class="h-32 rounded-3xl" />
			<Skeleton class="h-32 rounded-3xl" />
			<Skeleton class="h-32 rounded-3xl" />
		</div>
	{:else if items.length === 0}
		<div class="rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center dark:border-white/15 dark:bg-transparent">
			<Scale class="mx-auto size-10 text-stone-300 dark:text-slate-600" />
			<p class="mt-3 text-sm text-stone-500 dark:text-slate-400">هنوز کالایی برای مقایسه انتخاب نکردی</p>
			<Button href="/products" class="mt-3 rounded-full bg-brand font-bold text-white hover:bg-brand">دیدن کالاها</Button>
		</div>
	{:else}
		<div class="mb-4 flex justify-end">
			<Button variant="outline" onclick={() => compare.clear()} class="rounded-full text-xs">
				<Trash2 class="size-3.5" /> پاک کردن همه
			</Button>
		</div>
		<Card.Root class="overflow-hidden rounded-[28px]">
			<div class="overflow-x-auto">
				<table class="w-full min-w-[640px] text-sm">
					<thead>
						<tr class="border-b border-stone-200 dark:border-white/10">
							<th class="w-28 p-3 text-right text-xs text-stone-500 dark:text-slate-400">ویژگی</th>
							{#each items as p (p.id)}
								<th class="p-3 text-center">
									<div class="flex flex-col items-center gap-2">
										{#if fileUrl(p.image)}
											<img src={fileUrl(p.image)} alt={p.name} width="96" height="96" loading="lazy" decoding="async" class="h-20 w-20 object-contain" />
										{/if}
										<a href="/products/{p.slug}" class="line-clamp-2 max-w-32 font-bold hover:text-brand-dark dark:hover:text-brand">{p.name}</a>
										<button
											type="button"
											onclick={() => compare.toggle(p.id)}
											class="flex items-center gap-1 rounded-full bg-stone-100 px-2 py-1 text-[11px] hover:bg-red-50 hover:text-red-600 dark:bg-white/10 dark:hover:bg-red-500/10"
										>
											<X class="size-3" /> حذف
										</button>
									</div>
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each rows as r}
							<tr class="border-b border-stone-100 last:border-0 dark:border-white/5">
								<td class="bg-stone-50 p-3 text-xs font-bold text-stone-600 dark:bg-white/[0.02] dark:text-slate-300">{r.label}</td>
								{#each items as p (p.id)}
									<td class="p-3 text-center font-bold {r.label === 'قیمت' ? 'font-toman text-brand-dark dark:text-brand' : ''}">{r.get(p)}</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</Card.Root>
	{/if}
</section>
