<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import SearchableSelect from '$lib/components/SearchableSelect.svelte';
	import { loadProvinces } from '$lib/stores/provinces.svelte';
	import { ApiError, api } from '$lib/api/client';
	import type { Address, CheckoutResponse, InstallmentPlan, ProvinceWithCities, Shipment } from '$lib/api/types';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { auth } from '$lib/stores/auth.svelte';
	import { cart } from '$lib/stores/cart.svelte';
	import { toman, faDigits } from '$lib/format/money';
	import { toast } from 'svelte-sonner';
	import { MapPin, Plus } from 'lucide-svelte';

	let addresses = $state<Address[]>([]);
	let provinces = $state<ProvinceWithCities[]>([]);
	let shipments = $state<Shipment[]>([]);
	let shipmentId = $state<number | null>(null);
	let plans = $state<InstallmentPlan[]>([]);
	let planId = $state<number | null>(null);
	let loading = $state(true);
	let selectedAddress = $state<number | null>(null);
	let discountCode = $state('');
	let discountPreview = $state<number | null>(null);
	let discountLoading = $state(false);
	let discountError = $state<string | null>(null);
	let submitting = $state(false);
	let error = $state<string | null>(null);

	// new address form
	let showForm = $state(false);
	let provinceId = $state<number | null>(null);
	let cityId = $state<number | null>(null);
	let addressText = $state('');
	let postalCode = $state('');
	let receiverName = $state('');
	let receiverMobile = $state('');
	let saving = $state(false);

	const cities = $derived(provinces.find((p) => p.id === provinceId)?.cities ?? []);
	const postPrice = $derived(shipments.find((s) => s.id === shipmentId)?.default_price_rial ?? 0);

	onMount(async () => {
		if (!auth.loggedIn) {
			await goto('/login?next=/checkout');
			return;
		}
		if (cart.items.length === 0) {
			await goto('/cart');
			return;
		}
		try {
			const [addr, prov, ship, pl] = await Promise.all([
				api<Address[]>('/addresses'),
				loadProvinces(),
				api<Shipment[]>('/shipments').catch(() => [] as Shipment[]),
				api<InstallmentPlan[]>('/installments').catch(() => [] as InstallmentPlan[])
			]);
			addresses = addr;
			provinces = prov;
			shipments = ship;
			plans = pl;
			selectedAddress = addr.find((a) => a.is_default)?.id ?? addr[0]?.id ?? null;
			shipmentId = ship.find((s) => s.is_default)?.id ?? ship[0]?.id ?? null;
			showForm = addr.length === 0;
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'خطا در بارگذاری اطلاعات.';
		} finally {
			loading = false;
		}
	});

	async function checkDiscount() {
		discountError = null;
		discountPreview = null;
		const code = discountCode.trim();
		if (!code) return;
		discountLoading = true;
		try {
			const res = await api<{ valid: boolean; discount_rial: number }>('/discounts/check', {
				method: 'POST',
				body: JSON.stringify({ code, amount_rial: cart.total })
			});
			discountPreview = res.discount_rial;
			toast.success(`تخفیف ${toman(res.discount_rial)} اعمال شد ✓`);
		} catch (err) {
			discountError = err instanceof ApiError ? err.message : 'کد نامعتبر است';
		} finally {
			discountLoading = false;
		}
	}

	async function saveAddress(e: SubmitEvent) {
		e.preventDefault();
		error = null;
		if (!provinceId || !cityId || !addressText.trim() || !receiverName.trim()) {
			error = 'استان، شهر، آدرس و نام تحویل‌گیرنده الزامی است.';
			return;
		}
		if (!/^09\d{9}$/.test(receiverMobile.trim())) {
			error = 'موبایل تحویل‌گیرنده معتبر نیست.';
			return;
		}
		saving = true;
		try {
			const res = await api<{ id: number }>('/addresses', {
				method: 'POST',
				body: JSON.stringify({
					province_id: provinceId,
					city_id: cityId,
					address: addressText.trim(),
					postal_code: postalCode.trim() || null,
					receiver_name: receiverName.trim(),
					receiver_mobile: receiverMobile.trim(),
					is_default: addresses.length === 0
				})
			});
			addresses = await api<Address[]>('/addresses');
			selectedAddress = res.id;
			showForm = false;
			toast.success('آدرس ذخیره شد ✓');
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'ذخیره آدرس ناموفق بود.';
		} finally {
			saving = false;
		}
	}

	function goToPayment(res: CheckoutResponse) {
		if (!res.payment_url) {
			goto(`/account/orders/${res.order.ref_code}`);
			return;
		}
		const method = res.payment_form?.method?.toUpperCase() ?? 'GET';
		const inputs = res.payment_form?.inputs ?? {};
		if (method === 'GET') {
			const url = new URL(res.payment_url);
			for (const [k, v] of Object.entries(inputs)) url.searchParams.set(k, String(v));
			window.location.href = url.toString();
			return;
		}
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = res.payment_url;
		for (const [k, v] of Object.entries(inputs)) {
			const input = document.createElement('input');
			input.type = 'hidden';
			input.name = k;
			input.value = String(v);
			form.appendChild(input);
		}
		document.body.appendChild(form);
		form.submit();
	}

	async function submit() {
		error = null;
		if (!selectedAddress) {
			error = 'اول یه آدرس انتخاب کن.';
			return;
		}
		submitting = true;
		try {
			const res = await api<CheckoutResponse>('/checkout', {
				method: 'POST',
				body: JSON.stringify({
					address_id: selectedAddress,
					shipment_id: shipmentId,
					installment_plan_id: planId,
					discount_code: discountCode.trim() || null,
					items: cart.items.map((i) => ({
						product_id: i.productId,
						variant_id: i.variantId,
						quantity: i.qty
					}))
				})
			});
			cart.clear();
			toast.success(`سفارش ${res.order.ref_code} ثبت شد ✓`);
			goToPayment(res);
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'ثبت سفارش ناموفق بود.';
			submitting = false;
		}
	}
</script>

<SeoHead title="تسویه" description="تسویه حساب فروشگاه آرزو — انتخاب آدرس، روش ارسال و پرداخت امن" noindex />

<section class="mx-auto max-w-6xl px-4 py-8">
	<h1 class="display text-3xl text-stone-900 dark:text-white">تسویه حساب</h1>

	{#if loading}
		<div class="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
			<div class="flex flex-col gap-4">
				<Skeleton class="h-40 rounded-3xl" />
				<Skeleton class="h-32 rounded-3xl" />
			</div>
			<Skeleton class="h-72 rounded-3xl" />
		</div>
	{:else}
		<div class="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
			<div class="flex flex-col gap-4">
				<Card.Root>
					<Card.Header>
						<Card.Title class="flex items-center gap-2 text-base"><MapPin class="size-4" /> آدرس تحویل</Card.Title>
					</Card.Header>
					<Card.Content class="flex flex-col gap-2">
						{#each addresses as a (a.id)}
							<button
								type="button"
								onclick={() => (selectedAddress = a.id)}
								class="rounded-xl border p-3 text-right text-sm transition-colors {selectedAddress === a.id
									? 'border-brand bg-brand/5 dark:bg-brand/10'
									: 'border-stone-200 hover:border-stone-300 dark:border-white/10'}"
							>
								<p class="font-bold">{a.receiver_name} — <span class="tick">{faDigits(a.receiver_mobile)}</span></p>
								<p class="mt-1 text-stone-600 dark:text-slate-300">{a.province}، {a.city} — {a.address}</p>
							</button>
						{/each}
						{#if !showForm}
							<Button variant="outline" onclick={() => (showForm = true)} class="mt-1 w-fit rounded-full">
								<Plus class="size-4" /> آدرس جدید
							</Button>
						{/if}
						{#if showForm}
							<form onsubmit={saveAddress} class="relative mt-2 flex flex-col gap-3 overflow-hidden rounded-2xl border border-brand/20 bg-gradient-to-b from-brand/[0.06] to-transparent p-4 dark:border-brand/20" dir="rtl">
								<div class="relative flex flex-col gap-3">
								<div class="grid grid-cols-2 gap-3">
									<SearchableSelect
										label="استان"
										placeholder="انتخاب استان…"
										options={provinces.map((p) => ({ value: String(p.id), label: p.name }))}
										value={provinceId ? String(provinceId) : ''}
										onselect={(v) => {
											provinceId = Number(v) || null;
											cityId = null;
										}}
									/>
									<SearchableSelect
										label="شهر"
										placeholder={provinceId ? 'انتخاب شهر…' : 'اول استان را انتخاب کن'}
										options={cities.map((c) => ({ value: String(c.id), label: c.name }))}
										value={cityId ? String(cityId) : ''}
										disabled={!provinceId}
										onselect={(v) => (cityId = Number(v) || null)}
									/>
								</div>
								<div class="flex flex-col gap-1.5">
									<Label>نشانی کامل</Label>
									<Textarea bind:value={addressText} rows={2} class="rounded-xl" />
								</div>
								<div class="grid grid-cols-2 gap-3">
									<div class="flex flex-col gap-1.5">
										<Label>نام تحویل‌گیرنده</Label>
										<Input bind:value={receiverName} class="tick rounded-xl" />
									</div>
									<div class="flex flex-col gap-1.5">
										<Label>موبایل تحویل‌گیرنده</Label>
										<Input bind:value={receiverMobile} inputmode="tel" placeholder="09xxxxxxxxx" class="tick rounded-xl text-center" />
									</div>
								</div>
								<div class="flex flex-col gap-1.5">
									<Label>کد پستی (اختیاری)</Label>
									<Input bind:value={postalCode} inputmode="numeric" class="tick rounded-xl" />
								</div>
								<Button type="submit" disabled={saving} class="w-fit rounded-full bg-brand px-8 font-bold text-white hover:bg-brand">
									{saving ? '...' : 'ذخیره آدرس'}
								</Button>
								</div>
							</form>
						{/if}
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">روش ارسال</Card.Title>
					</Card.Header>
					<Card.Content class="flex flex-col gap-2">
						{#if shipments.length === 0}
							<p class="text-xs text-stone-500 dark:text-slate-400">هزینه ارسال موقع تحویل مشخص میشه</p>
						{:else}
							{#each shipments as s (s.id)}
								<button
									type="button"
									onclick={() => (shipmentId = s.id)}
									class="flex items-center justify-between rounded-xl border p-3 text-sm transition-colors {shipmentId === s.id
										? 'border-brand bg-brand/5 dark:bg-brand/10'
										: 'border-stone-200 hover:border-stone-300 dark:border-white/10'}"
								>
									<span class="font-bold">{s.title}</span>
									<span class="font-toman text-xs font-bold text-stone-600 dark:text-slate-300">
										{s.default_price_rial > 0 ? toman(s.default_price_rial) : 'رایگان'}
									</span>
								</button>
							{/each}
						{/if}
					</Card.Content>
				</Card.Root>

				{#if plans.length > 0}
					<Card.Root>
						<Card.Header>
							<Card.Title class="text-base">خرید قسطی <span class="text-xs font-normal text-stone-500 dark:text-slate-400">(اختیاری)</span></Card.Title>
						</Card.Header>
						<Card.Content class="flex flex-col gap-2">
							<button
								type="button"
								onclick={() => (planId = null)}
								class="rounded-xl border p-3 text-right text-sm transition-colors {planId === null
									? 'border-brand bg-brand/5 dark:bg-brand/10'
									: 'border-stone-200 hover:border-stone-300 dark:border-white/10'}"
							>
								<span class="font-bold">نقدی</span>
							</button>
							{#each plans as pl (pl.id)}
								<button
									type="button"
									onclick={() => (planId = pl.id)}
									class="rounded-xl border p-3 text-right text-sm transition-colors {planId === pl.id
										? 'border-brand bg-brand/5 dark:bg-brand/10'
										: 'border-stone-200 hover:border-stone-300 dark:border-white/10'}"
								>
									<span class="font-bold">{pl.title}</span>
									<span class="tick mt-0.5 block text-xs text-stone-500 dark:text-slate-400">
										پیش‌پرداخت ٪{faDigits(pl.down_payment_percent)} • {faDigits(pl.months)} ماهه
									</span>
								</button>
							{/each}
						</Card.Content>
					</Card.Root>
				{/if}

				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">کد تخفیف</Card.Title>
					</Card.Header>
					<Card.Content class="flex flex-col gap-2">
						<div class="flex gap-2">
							<Input
								bind:value={discountCode}
								placeholder="اگه کد تخفیف داری بزن"
								class="tick flex-1 rounded-xl text-center"
								onkeydown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										checkDiscount();
									}
								}}
							/>
							<Button
								variant="outline"
								onclick={checkDiscount}
								disabled={discountLoading || !discountCode.trim()}
								class="shrink-0 rounded-xl"
							>
								{discountLoading ? '...' : 'اعمال'}
							</Button>
						</div>
						{#if discountPreview !== null}
							<p class="text-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
								تخفیف {toman(discountPreview)} — قابل پرداخت {toman(cart.total + postPrice - discountPreview)}
							</p>
						{/if}
						{#if discountError}
							<p class="text-center text-xs font-bold text-red-600">{discountError}</p>
						{/if}
					</Card.Content>
				</Card.Root>
			</div>

			<div>
				<Card.Root class="lg:sticky lg:top-24">
					<Card.Header>
						<Card.Title class="text-base">سفارشت ({faDigits(cart.count)} کالا)</Card.Title>
					</Card.Header>
					<Card.Content class="flex flex-col gap-2 text-sm">
						{#each cart.items as i (i.key)}
							<div class="flex justify-between gap-2 text-stone-600 dark:text-slate-300">
								<span class="truncate">{i.name} <span class="tick">× {faDigits(i.qty)}</span></span>
								<span class="font-toman shrink-0 font-bold">{toman(i.price * i.qty)}</span>
							</div>
						{/each}
						<Separator class="my-1" />
						<div class="flex justify-between text-stone-600 dark:text-slate-300">
							<span>جمع کالاها</span>
							<span class="font-toman font-bold">{toman(cart.total)}</span>
						</div>
						<div class="flex justify-between text-stone-600 dark:text-slate-300">
							<span>هزینه ارسال</span>
							<span class="font-toman font-bold">{postPrice > 0 ? toman(postPrice) : '—'}</span>
						</div>
						{#if discountPreview !== null}
							<div class="flex justify-between text-emerald-600 dark:text-emerald-400">
								<span>تخفیف</span>
								<span class="font-toman font-bold">− {toman(discountPreview)}</span>
							</div>
						{/if}
						<div class="flex justify-between font-bold">
							<span>قابل پرداخت</span>
							<span class="font-toman text-brand-dark dark:text-brand">{toman(cart.total + postPrice - (discountPreview ?? 0))}</span>
						</div>
						{#if error}
							<p class="text-center text-sm font-bold text-red-600">{error}</p>
						{/if}
						<Button onclick={submit} disabled={submitting} class="mt-2 w-full rounded-full bg-brand font-extrabold text-white hover:bg-brand">
							{submitting ? 'در حال ثبت…' : 'ثبت سفارش و پرداخت'}
						</Button>
						<div class="mt-2 flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold text-stone-500 dark:text-slate-400">
							<span class="flex items-center gap-1"><span class="size-1.5 rounded-full bg-emerald-500"></span> پرداخت امن</span>
							<span>•</span>
							<span>۷ روز مرجوعی</span>
							<span>•</span>
							<span>ضمانت اصالت</span>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	{/if}
</section>
