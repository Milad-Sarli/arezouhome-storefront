<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { ApiError, api } from '$lib/api/client';
	import type { Order } from '$lib/api/types';
	import { toman } from '$lib/format/money';
	import { jalaliLong } from '$lib/format/jalali';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { auth } from '$lib/stores/auth.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { Download } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	const ref = $derived(page.params.ref);

	let order = $state<Order | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let invoicing = $state(false);
	let canceling = $state(false);

	const pay = $derived(page.url.searchParams.get('pay'));
	const msg = $derived(page.url.searchParams.get('msg'));

	async function downloadInvoice() {
		if (!auth.token) {
			toast.error('ابتدا وارد شو');
			return;
		}
		invoicing = true;
		try {
			const res = await fetch(`${PUBLIC_API_URL}/orders/${ref}/invoice`, {
				headers: { Authorization: `Bearer ${auth.token}`, Accept: 'text/html' }
			});
			if (!res.ok) throw new Error('خطا در دریافت فاکتور');
			const html = await res.text();
			const w = window.open('', '_blank');
			if (w) {
				w.document.write(html);
				w.document.close();
			}
		} catch {
			toast.error('دریافت فاکتور ناموفق بود');
		} finally {
			invoicing = false;
		}
	}

	async function cancelOrder() {
		if (!confirm('مطمئنی می‌خوای سفارش رو لغو کنی؟')) return;
		canceling = true;
		try {
			const res = await api<{ data: Order }>(`/orders/${ref}/cancel`, { method: 'PATCH' });
			order = res.data;
			toast.success('سفارش لغو شد');
		} catch (err) {
			toast.error(err instanceof ApiError ? err.message : 'لغو ناموفق بود');
		} finally {
			canceling = false;
		}
	}

	onMount(async () => {
		try {
			const res = await api<{ data: Order } | Order>(`/orders/${ref}`);
			order = 'data' in res && res.data ? (res.data as Order) : (res as Order);
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'سفارش پیدا نشد.';
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>سفارش {ref} | حساب من</title>
</svelte:head>

<section>
	{#if loading}
		<div class="flex flex-col gap-3">
			<Skeleton class="h-10 w-1/3 rounded-2xl" />
			<Skeleton class="h-64 rounded-3xl" />
			<Skeleton class="h-40 rounded-2xl" />
		</div>
	{:else if error || !order}
		<p class="text-sm font-bold text-red-600">{error ?? 'سفارش پیدا نشد.'}</p>
	{:else}
		{#if pay === 'ok'}
			<div class="success-pop mb-4 rounded-2xl border border-green-300 bg-green-50 px-4 py-3 text-sm font-bold text-green-800 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
				{msg ?? 'پرداخت با موفقیت انجام شد ✓'}
			</div>
		{:else if pay === 'fail'}
			<div class="mb-4 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
				{msg ?? 'پرداخت ناموفق بود.'}
			</div>
		{/if}
		{#if order.status === 'delivered'}
			<div class="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
				<p class="text-sm font-extrabold text-amber-800 dark:text-amber-200">سفارشت تحویل داده شده — نظرت رو ثبت کن 🌟</p>
				<div class="mt-2 flex flex-col gap-1">
					{#each order.items as it}
						{#if it.product_slug}
							<a href="/products/{it.product_slug}#reviews" class="text-xs font-bold text-brand-dark hover:underline dark:text-brand">
								امتیاز به {it.product_name} →
							</a>
						{/if}
					{/each}
				</div>
			</div>
		{/if}
		<div class="flex items-center justify-between gap-2">
			<div>
				<h1 class="display tick text-2xl text-stone-900 dark:text-white" dir="ltr">{order.ref_code}</h1>
				<p class="mt-1 text-xs text-stone-500 dark:text-slate-400">{jalaliLong(order.created_at)}</p>
			</div>
			<div class="flex items-center gap-2">
				<Badge variant="secondary" class="rounded-full">{order.status_label}</Badge>
				{#if order.status === 'pending'}
					<Button
						variant="outline"
						size="sm"
						onclick={cancelOrder}
						disabled={canceling}
						class="rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-600 dark:border-red-500/30 dark:text-red-400"
					>
						{canceling ? '...' : 'لغو سفارش'}
					</Button>
				{/if}
				<Button
					variant="outline"
					size="sm"
					onclick={downloadInvoice}
					disabled={invoicing}
					class="rounded-full"
					aria-label="دانلود فاکتور"
				>
					<Download class="size-4" /> {invoicing ? '...' : 'فاکتور'}
				</Button>
			</div>
		</div>
		<Card.Root class="mt-4">
			<Card.Content class="flex flex-col gap-2 p-4 text-sm">
				{#each order.items as i}
					<div class="flex justify-between gap-2">
						<span class="text-stone-700 dark:text-slate-200">{i.product_name} <span class="tick text-stone-500">× {i.quantity.toLocaleString('fa-IR')}</span></span>
						<span class="font-toman shrink-0 font-bold">{toman(i.total_rial)}</span>
					</div>
				{/each}
				<Separator class="my-1" />
				<div class="flex justify-between text-stone-600 dark:text-slate-300">
					<span>هزینه ارسال {order.shipment ? `(${order.shipment})` : ''}</span>
					<span class="font-toman font-bold">{toman(order.post_price_rial)}</span>
				</div>
				{#if order.discount_price_rial > 0}
					<div class="flex justify-between text-green-700 dark:text-green-400">
						<span>تخفیف</span>
						<span class="font-toman font-bold">− {toman(order.discount_price_rial)}</span>
					</div>
				{/if}
				<div class="flex justify-between text-base font-extrabold">
					<span>جمع نهایی</span>
					<span class="font-toman text-brand-dark dark:text-brand">{toman(order.final_price_rial)}</span>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}
</section>
