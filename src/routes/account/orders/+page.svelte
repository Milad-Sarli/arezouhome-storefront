<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { ApiError, api, type ApiList } from '$lib/api/client';
	import type { Order } from '$lib/api/types';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { toman } from '$lib/format/money';
	import { jalali } from '$lib/format/jalali';

	let orders = $state<Order[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			const res = await api<ApiList<Order> | Order[]>('/orders');
			orders = Array.isArray(res) ? res : res.data;
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'خطا در بارگذاری سفارش‌ها.';
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>سفارش‌ها | حساب من</title>
</svelte:head>

<section>
	<h1 class="display text-2xl md:text-3xl">سفارش‌های من</h1>

	{#if loading}
		<div class="mt-6 flex flex-col gap-3">
			<Skeleton class="h-20 rounded-2xl" />
			<Skeleton class="h-20 rounded-2xl" />
			<Skeleton class="h-20 rounded-2xl" />
			<Skeleton class="h-20 rounded-2xl" />
		</div>
	{:else if error}
		<p class="mt-6 text-sm font-bold text-red-600">{error}</p>
	{:else if orders.length === 0}
		<Card.Root class="mt-6 text-center">
			<Card.Content class="py-12">
				<p class="font-bold text-stone-600 dark:text-slate-300">هنوز سفارشی ثبت نکردی</p>
				<Button href="/products" class="mt-3 rounded-full bg-brand font-bold text-white hover:bg-brand">
					دیدن کالاها
				</Button>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="mt-6 flex flex-col gap-3">
			{#each orders as o (o.ref_code)}
				<a href="/account/orders/{o.ref_code}">
					<Card.Root class="transition-shadow hover:shadow-md">
						<Card.Content class="flex items-center justify-between gap-3 p-4">
							<div>
								<p class="tick text-sm font-bold" dir="ltr">{o.ref_code}</p>
								<p class="mt-1 text-xs text-stone-500 dark:text-slate-400">{jalali(o.created_at)}</p>
							</div>
							<div class="flex items-center gap-3">
								<span class="font-toman text-sm font-bold text-brand-dark dark:text-brand">{toman(o.final_price_rial)}</span>
								<Badge variant="secondary" class="rounded-full">{o.status_label}</Badge>
							</div>
						</Card.Content>
					</Card.Root>
				</a>
			{/each}
		</div>
	{/if}
</section>
