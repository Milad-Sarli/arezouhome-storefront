<script lang="ts">
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Reveal from '$lib/components/Reveal.svelte';
	import { ApiError, api, type ApiList } from '$lib/api/client';
	import type { Address, Order } from '$lib/api/types';
	import { auth } from '$lib/stores/auth.svelte';
	import { wishlist } from '$lib/stores/wishlist.svelte';
	import { toman, faDigits } from '$lib/format/money';
	import { jalali } from '$lib/format/jalali';
	import { toast } from 'svelte-sonner';
	import { Package, Heart, MapPin, ArrowLeft, Pencil, KeyRound } from 'lucide-svelte';

	let orderTotal = $state(0);
	let recent = $state<Order[]>([]);
	let addressCount = $state(0);
	let name = $state('');
	let editing = $state(false);
	let saving = $state(false);
	let pw1 = $state('');
	let pw2 = $state('');
	let pwSaving = $state(false);

	onMount(async () => {
		name = auth.user?.name ?? '';
		try {
			const [orders, addr] = await Promise.all([
				api<ApiList<Order>>('/orders'),
				api<Address[]>('/addresses').catch(() => [] as Address[])
			]);
			orderTotal = orders.data.length;
			recent = orders.data.slice(0, 3);
			addressCount = addr.length;
		} catch (err) {
			console.error(err instanceof ApiError ? err.message : err);
		}
	});

	const stats = $derived([
		{ icon: Package, label: 'سفارش‌ها', value: faDigits(orderTotal), href: '/account/orders', tint: 'bg-brand/10 text-brand-dark dark:text-brand' },
		{ icon: Heart, label: 'علاقه‌مندی‌ها', value: faDigits(wishlist.count), href: '/account/wishlist', tint: 'bg-red-500/10 text-red-500' },
		{ icon: MapPin, label: 'آدرس‌ها', value: faDigits(addressCount), href: '/account/addresses', tint: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' }
	]);

	async function saveName(e: SubmitEvent) {
		e.preventDefault();
		if (name.trim().length < 2) {
			toast.error('نام کوتاهه!');
			return;
		}
		saving = true;
		try {
			await auth.updateName(name.trim());
			editing = false;
			toast.success('نام به‌روز شد ✓');
		} catch (err) {
			toast.error(err instanceof ApiError ? err.message : 'خطا در ذخیره.');
		} finally {
			saving = false;
		}
	}

	async function savePassword(e: SubmitEvent) {
		e.preventDefault();
		if (pw1.length < 6) {
			toast.error('رمز عبور حداقل ۶ نویسه باشد');
			return;
		}
		if (pw1 !== pw2) {
			toast.error('تکرار رمز با رمز یکی نیست');
			return;
		}
		pwSaving = true;
		try {
			await auth.setPassword(pw1, pw2);
			pw1 = '';
			pw2 = '';
			toast.success('رمز عبور ثبت شد ✓');
		} catch (err) {
			toast.error(err instanceof ApiError ? err.message : 'خطا در ذخیره رمز.');
		} finally {
			pwSaving = false;
		}
	}
</script>

<svelte:head>
	<title>داشبورد | فروشگاه آرزو</title>
</svelte:head>

<Reveal>
	<Card.Root class="rounded-3xl">
		<Card.Content class="flex flex-wrap items-center gap-3 p-4">
			<span class="text-sm text-stone-500 dark:text-slate-400">نام نمایشی:</span>
			{#if editing}
				<form onsubmit={saveName} class="flex flex-1 items-center gap-2 rounded-2xl border border-brand/30 bg-brand/[0.04] p-2 ps-3 dark:bg-brand/10">
					<input
						bind:value={name}
						maxlength={255}
						aria-label="نام نمایشی"
						class="tick w-full min-w-0 flex-1 bg-transparent px-1 py-1.5 text-sm outline-none placeholder:text-stone-400"
						placeholder="نامت را بنویس…"
					/>
					<button type="submit" disabled={saving} class="shrink-0 rounded-full bg-brand px-4 py-1.5 text-xs font-bold text-white hover:bg-brand">
						{saving ? '...' : 'ذخیره'}
					</button>
				</form>
			{:else}
				<span class="font-extrabold">{auth.user?.name ?? '…'}</span>
				<button
					type="button"
					onclick={() => {
						name = auth.user?.name ?? '';
						editing = true;
					}}
					aria-label="ویرایش نام"
					class="rounded-full p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-brand-dark dark:hover:bg-white/10"
				>
					<Pencil class="size-3.5" />
				</button>
			{/if}
			<span class="tick ms-auto text-xs text-stone-400 dark:text-slate-500" dir="ltr">{faDigits(auth.user?.phone ?? '')}</span>
		</Card.Content>
	</Card.Root>
</Reveal>

<div class="mt-4 grid gap-4 sm:grid-cols-3">
	{#each stats as s, i (s.label)}
		<Reveal delay={i * 80}>
			<a
				href={s.href}
				class="group flex items-center gap-3 rounded-3xl border border-stone-200/80 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/50 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none"
			>
				<span class="flex size-11 shrink-0 items-center justify-center rounded-2xl {s.tint}">
					<s.icon class="size-5" />
				</span>
				<span>
					<span class="tick display block text-xl leading-7">{s.value}</span>
					<span class="block text-xs text-stone-500 dark:text-slate-400">{s.label}</span>
				</span>
				<ArrowLeft class="ms-auto size-4 text-stone-300 transition-transform group-hover:-translate-x-1 dark:text-slate-600" />
			</a>
		</Reveal>
	{/each}
</div>

<Reveal class="mt-4">
	<Card.Root class="rounded-3xl">
		<Card.Header>
			<Card.Title class="flex items-center gap-2 text-base">
				<KeyRound class="size-4 text-brand-dark dark:text-brand" />
				رمز ورود
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<form onsubmit={savePassword} class="flex flex-col gap-3" dir="rtl">
				<p class="text-xs leading-6 text-stone-500 dark:text-slate-400">
					اگر با کد پیامک ثبت‌نام کردی و هنوز رمز نداری، از همین‌جا رمز تعیین کن. بعدش می‌تونی با موبایل و رمز وارد شی.
				</p>
				<div class="grid gap-3 sm:grid-cols-2">
					<input
						type="password"
						bind:value={pw1}
						minlength={6}
						maxlength={72}
						autocomplete="new-password"
						placeholder="رمز جدید (حداقل ۶ نویسه)"
						aria-label="رمز جدید"
						class="w-full rounded-xl border border-stone-200 bg-transparent px-3 py-2.5 text-center text-sm tracking-widest outline-none placeholder:text-stone-400 focus:border-brand dark:border-white/10"
					/>
					<input
						type="password"
						bind:value={pw2}
						minlength={6}
						maxlength={72}
						autocomplete="new-password"
						placeholder="تکرار رمز جدید"
						aria-label="تکرار رمز جدید"
						class="w-full rounded-xl border border-stone-200 bg-transparent px-3 py-2.5 text-center text-sm tracking-widest outline-none placeholder:text-stone-400 focus:border-brand dark:border-white/10"
					/>
				</div>
				<div>
					<button
						type="submit"
						disabled={pwSaving}
						class="rounded-full bg-brand px-6 py-2 text-xs font-bold text-white hover:bg-brand disabled:opacity-50"
					>
						{pwSaving ? '...' : 'ثبت رمز جدید'}
					</button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</Reveal>

<Reveal class="mt-5">
	<Card.Root class="rounded-3xl">
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">سفارش‌های اخیر</Card.Title>
			<a href="/account/orders" class="text-xs font-bold text-brand-dark hover:underline dark:text-brand">همه ←</a>
		</Card.Header>
		<Card.Content class="flex flex-col gap-2">
			{#if recent.length === 0}
				<p class="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500 dark:border-white/15 dark:text-slate-400">
					هنوز سفارشی ثبت نکردی — <a href="/products" class="font-bold text-brand-dark dark:text-brand">بریم خرید؟ 🛒</a>
				</p>
			{:else}
				{#each recent as o (o.ref_code)}
					<a
						href="/account/orders/{o.ref_code}"
						class="flex items-center justify-between gap-3 rounded-2xl border border-stone-100 p-3 transition-colors hover:border-brand/40 dark:border-white/5 dark:hover:border-brand/40"
					>
						<div>
							<p class="tick text-sm font-bold" dir="ltr">{o.ref_code}</p>
							<p class="mt-0.5 text-[11px] text-stone-500 dark:text-slate-400">{jalali(o.created_at)}</p>
						</div>
						<div class="flex items-center gap-2.5">
							<span class="font-toman text-sm font-bold text-brand-dark dark:text-brand">{toman(o.final_price_rial)}</span>
							<Badge variant="secondary" class="rounded-full text-[11px]">{o.status_label}</Badge>
						</div>
					</a>
				{/each}
			{/if}
		</Card.Content>
	</Card.Root>
</Reveal>
