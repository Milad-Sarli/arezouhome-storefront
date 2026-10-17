<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import Reveal from './Reveal.svelte';
	import FormCard from './FormCard.svelte';
	import { ApiError, api } from '$lib/api/client';
	import type { Order } from '$lib/api/types';
	import { toman, faDigits } from '$lib/format/money';
	import { jalaliLong } from '$lib/format/jalali';
	import { PackageSearch, Check } from 'lucide-svelte';

	const STEPS = [
		{ key: 'created', label: 'ثبت سفارش' },
		{ key: 'paid', label: 'پرداخت' },
		{ key: 'shipped', label: 'ارسال' },
		{ key: 'delivered', label: 'تحویل' }
	];
	const RANK: Record<string, number> = { pending: 0, paid: 1, processing: 1, shipped: 2, delivered: 3 };

	let { initialRef = '' }: { initialRef?: string } = $props();

	let ref = $state(initialRef.toUpperCase());
	let order = $state<Order | null>(null);
	let busy = $state(false);
	let error = $state<string | null>(null);

	const rank = $derived(order ? (RANK[order.status] ?? -1) : -1);
	const closed = $derived(order ? ['canceled', 'returned'].includes(order.status) : false);

	async function track(e?: SubmitEvent) {
		e?.preventDefault();
		error = null;
		order = null;
		const code = ref.trim().toUpperCase();
		if (!code) {
			error = 'کد پیگیری رو وارد کن';
			return;
		}
		busy = true;
		try {
			const res = await api<{ data: Order }>(`/track/${encodeURIComponent(code)}`);
			order = res.data;
		} catch (err) {
			error = err instanceof ApiError ? 'سفارشی با این کد پیدا نشد.' : 'خطا در پیگیری.';
		} finally {
			busy = false;
		}
	}

	if (ref) track();
</script>

<FormCard title="پیگیری سفارش" subtitle="کد پیگیری را وارد کن" icon={PackageSearch}>
	<form onsubmit={track} class="flex flex-col gap-2 sm:flex-row" dir="rtl">
		<div class="flex-1">
			<Label for="ref" class="sr-only">کد پیگیری</Label>
			<Input
				id="ref"
				bind:value={ref}
				placeholder="AH-..."
				dir="ltr"
				class="tick rounded-2xl text-center tracking-widest"
			/>
		</div>
		<Button type="submit" disabled={busy} class="rounded-2xl bg-brand px-8 font-extrabold text-white hover:bg-brand">
			<PackageSearch class="size-4" /> {busy ? '...' : 'پیگیری'}
		</Button>
	</form>
	{#if error}
		<p class="mt-3 text-center text-sm font-bold text-red-600">{error}</p>
	{/if}
</FormCard>

{#if order}
	<Reveal class="mt-6">
		<Card.Root class="rounded-3xl">
			<Card.Content class="p-5">
				<div class="flex items-center justify-between gap-2">
					<div>
						<p class="tick text-lg font-black" dir="ltr">{order.ref_code}</p>
						<p class="mt-0.5 text-xs text-stone-500 dark:text-slate-400">{jalaliLong(order.created_at)}</p>
					</div>
					<Badge variant="secondary" class="rounded-full">{order.status_label}</Badge>
				</div>
				{#if !closed && rank >= 0}
					<ol class="mt-6 flex items-start" dir="rtl">
						{#each STEPS as s, i}
							{@const current = i === rank && rank < 3}
							<li class="flex flex-1 flex-col items-center gap-1.5 {i > 0 ? '-ms-1' : ''}">
								<span
									class="flex size-8 items-center justify-center rounded-full border-2 font-black {i < rank || rank === 3
										? 'border-emerald-500 bg-emerald-500 text-white'
										: current
											? 'border-brand bg-brand/10 text-brand-dark dark:text-brand'
											: 'border-stone-200 text-stone-300 dark:border-white/15 dark:text-slate-600'}"
								>
									{#if i < rank || rank === 3}<Check class="size-4" />{:else}<span class="tick text-xs">{faDigits(i + 1)}</span>{/if}
								</span>
								<span class="text-[11px] font-bold {i <= rank ? 'text-stone-800 dark:text-slate-100' : 'text-stone-400'}">{s.label}</span>
							</li>
							{#if i < STEPS.length - 1}
								<span class="mt-4 h-0.5 flex-1 rounded {i < rank ? 'bg-emerald-500' : 'bg-stone-200 dark:bg-white/15'}"></span>
							{/if}
						{/each}
					</ol>
				{/if}
				<Separator class="my-4" />
				<div class="flex flex-col gap-1.5 text-sm">
					{#each order.items as it}
						<div class="flex justify-between gap-2 text-stone-600 dark:text-slate-300">
							<span class="truncate">{it.product_name} <span class="tick">× {it.quantity.toLocaleString('fa-IR')}</span></span>
							<span class="font-toman shrink-0 font-bold">{toman(it.total_rial)}</span>
						</div>
					{/each}
					<div class="mt-1 flex justify-between font-extrabold">
						<span>جمع نهایی</span>
						<span class="font-toman text-brand-dark dark:text-brand">{toman(order.final_price_rial)}</span>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</Reveal>
{/if}
