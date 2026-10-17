<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Reveal from '$lib/components/Reveal.svelte';
	import FormCard from '$lib/components/FormCard.svelte';
	import SearchableSelect from '$lib/components/SearchableSelect.svelte';
	import { ApiError, api, type ApiList } from '$lib/api/client';
	import type { ReturnRequest, Order } from '$lib/api/types';
	import { toast } from 'svelte-sonner';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { RotateCcw, Plus } from 'lucide-svelte';
	import { jalali } from '$lib/format/jalali';

	let returns = $state<ReturnRequest[]>([]);
	let orders = $state<Order[]>([]);
	let loading = $state(true);
	let orderId = $state<number | null>(null);
	let reason = $state('');
	let description = $state('');
	let sending = $state(false);
	let showForm = $state(false);

	async function load() {
		loading = true;
		try {
			const [r, o] = await Promise.all([
				api<ApiList<ReturnRequest>>('/returns'),
				api<ApiList<Order>>('/orders').catch(() => ({ data: [] }) as ApiList<Order>)
			]);
			returns = r.data ?? [];
			orders = o.data ?? [];
		} catch (err) {
			toast.error(err instanceof ApiError ? err.message : 'خطا در بارگذاری');
		} finally {
			loading = false;
		}
	}

	onMount(load);

	async function create(e: SubmitEvent) {
		e.preventDefault();
		if (!orderId || !reason.trim()) {
			toast.error('سفارش و دلیل را وارد کن');
			return;
		}
		sending = true;
		try {
			await api('/returns', { method: 'POST', body: JSON.stringify({ order_id: orderId, reason: reason.trim(), description: description.trim() || null }) });
			toast.success('درخواست مرجوعی ثبت شد ✓');
			reason = '';
			description = '';
			showForm = false;
			await load();
		} catch (err) {
			toast.error(err instanceof ApiError ? err.message : 'ثبت ناموفق');
		} finally {
			sending = false;
		}
	}
</script>

<svelte:head>
	<title>مرجوعی‌ها | حساب من</title>
</svelte:head>

<h1 class="display flex items-center gap-2 text-2xl md:text-3xl"><RotateCcw class="size-6 text-brand" /> درخواست مرجوعی</h1>
<p class="mt-1 text-sm text-stone-500 dark:text-slate-400">تا ۷ روز پس از تحویل — بدون قید و شرط</p>

{#if !showForm}
	<Button onclick={() => (showForm = true)} class="mt-4 rounded-full bg-brand font-bold text-white hover:bg-brand">
		<Plus class="size-4" /> درخواست جدید
	</Button>
{:else}
	<FormCard title="درخواست جدید" subtitle="کالا را پس بده، بی‌قید و شرط" icon={RotateCcw} cls="mt-4">
		<form onsubmit={create} class="flex flex-col gap-3" dir="rtl">
				<div class="flex flex-col gap-1.5">
					<SearchableSelect
						label="سفارش"
						placeholder="انتخاب سفارش…"
						options={orders.map((o) => ({ value: String(o.id), label: `${o.ref_code} — ${o.status_label}` }))}
						value={orderId ? String(orderId) : ''}
						onselect={(v) => (orderId = Number(v) || null)}
					/>
					{#if orders.length === 0}
						<p class="text-[11px] text-stone-500">هنوز سفارشی نداری — اول خرید کن</p>
					{/if}
				</div>
				<div class="flex flex-col gap-1.5">
					<Label>دلیل مرجوعی</Label>
					<Input bind:value={reason} placeholder="مثلا: کالا آسیب دیده" class="rounded-xl" maxlength={255} />
				</div>
				<div class="flex flex-col gap-1.5">
					<Label>توضیحات (اختیاری)</Label>
					<Textarea bind:value={description} rows={3} class="rounded-xl" maxlength={2000} />
				</div>
				<div class="flex gap-2">
					<Button type="submit" disabled={sending} class="rounded-full bg-brand font-bold text-white hover:bg-brand">{sending ? '...' : 'ثبت درخواست'}</Button>
					<Button type="button" variant="outline" onclick={() => (showForm = false)} class="rounded-full">انصراف</Button>
				</div>
			</form>
	</FormCard>
{/if}

{#if loading}
	<div class="mt-6 flex flex-col gap-3">
		<Skeleton class="h-20 rounded-2xl" />
		<Skeleton class="h-20 rounded-2xl" />
		<Skeleton class="h-20 rounded-2xl" />
	</div>
{:else if returns.length === 0}
	<p class="mt-6 rounded-3xl border border-dashed border-stone-300 p-10 text-center text-sm text-stone-500 dark:border-white/15 dark:text-slate-400">هنوز درخواست مرجوعی نداری</p>
{:else}
	<div class="mt-4 flex flex-col gap-3">
		{#each returns as r (r.id)}
			<Reveal>
				<Card.Root class="rounded-2xl">
					<Card.Content class="flex items-center justify-between gap-3 p-4">
						<div>
							<p class="text-sm font-extrabold">{r.reason} {#if r.order_ref}<span class="tick font-normal text-stone-500">— {r.order_ref}</span>{/if}</p>
							<p class="mt-1 text-xs text-stone-500 dark:text-slate-400">{jalali(r.created_at)}</p>
						</div>
						<Badge variant="secondary" class="rounded-full text-[11px]">{r.status_label}</Badge>
					</Card.Content>
				</Card.Root>
			</Reveal>
		{/each}
	</div>
{/if}
