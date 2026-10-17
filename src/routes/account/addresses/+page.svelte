<script lang="ts">
	import { goto } from '$app/navigation';
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
	import { loadProvinces } from '$lib/stores/provinces.svelte';
	import { ApiError, api } from '$lib/api/client';
	import type { Address, ProvinceWithCities } from '$lib/api/types';
	import { auth } from '$lib/stores/auth.svelte';
	import { faDigits } from '$lib/format/money';
	import { toast } from 'svelte-sonner';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { MapPin, Plus, Pencil, Trash2, Star } from 'lucide-svelte';

	let addresses = $state<Address[]>([]);
	let provinces = $state<ProvinceWithCities[]>([]);
	let loading = $state(true);
	let editingId = $state<number | 'new' | null>(null);
	let saving = $state(false);

	let provinceId = $state<number | null>(null);
	let cityId = $state<number | null>(null);
	let addressText = $state('');
	let postalCode = $state('');
	let receiverName = $state('');
	let receiverMobile = $state('');

	const cities = $derived(provinces.find((p) => p.id === provinceId)?.cities ?? []);

	onMount(async () => {
		await reload();
	});

	async function reload() {
		loading = true;
		try {
			const [addr, prov] = await Promise.all([
				api<Address[]>('/addresses'),
				loadProvinces()
			]);
			addresses = addr;
			provinces = prov;
		} catch (err) {
			toast.error(err instanceof ApiError ? err.message : 'خطا در بارگذاری.');
		} finally {
			loading = false;
		}
	}

	function openNew() {
		editingId = 'new';
		provinceId = null;
		cityId = null;
		addressText = '';
		postalCode = '';
		receiverName = auth.user?.name ?? '';
		receiverMobile = auth.user?.phone ?? '';
	}

	function openEdit(a: Address) {
		editingId = a.id;
		const prov = provinces.find((p) => p.name === a.province);
		provinceId = prov?.id ?? null;
		cityId = prov?.cities.find((c) => c.name === a.city)?.id ?? null;
		addressText = a.address;
		postalCode = a.postal_code ?? '';
		receiverName = a.receiver_name;
		receiverMobile = a.receiver_mobile;
	}

	async function save(e: SubmitEvent) {
		e.preventDefault();
		if (!provinceId || !cityId || !addressText.trim() || !receiverName.trim()) {
			toast.error('استان، شهر، آدرس و نام تحویل‌گیرنده الزامی است.');
			return;
		}
		if (!/^09\d{9}$/.test(receiverMobile.trim())) {
			toast.error('موبایل تحویل‌گیرنده معتبر نیست.');
			return;
		}
		saving = true;
		try {
			const payload = {
				province_id: provinceId,
				city_id: cityId,
				address: addressText.trim(),
				postal_code: postalCode.trim() || null,
				receiver_name: receiverName.trim(),
				receiver_mobile: receiverMobile.trim()
			};
			if (editingId === 'new') {
				await api('/addresses', {
					method: 'POST',
					body: JSON.stringify({ ...payload, is_default: addresses.length === 0 })
				});
				toast.success('آدرس ذخیره شد ✓');
			} else {
				await api(`/addresses/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) });
				toast.success('آدرس به‌روز شد ✓');
			}
			editingId = null;
			await reload();
		} catch (err) {
			toast.error(err instanceof ApiError ? err.message : 'ذخیره ناموفق بود.');
		} finally {
			saving = false;
		}
	}

	async function remove(id: number) {
		try {
			await api(`/addresses/${id}`, { method: 'DELETE' });
			toast.success('آدرس حذف شد');
			await reload();
		} catch (err) {
			toast.error(err instanceof ApiError ? err.message : 'حذف ناموفق بود.');
		}
	}

	async function setDefault(id: number) {
		try {
			await api(`/addresses/${id}`, {
				method: 'PATCH',
				body: JSON.stringify({ is_default: true })
			});
			toast.success('آدرس پیش‌فرض شد ✓');
			await reload();
		} catch (err) {
			toast.error(err instanceof ApiError ? err.message : 'ناموفق بود.');
		}
	}
</script>

<svelte:head>
	<title>آدرس‌ها | فروشگاه آرزو</title>
</svelte:head>

<section>
	<div class="flex items-center justify-between">
		<h1 class="display text-2xl md:text-3xl">آدرس‌ها</h1>
		{#if editingId === null}
			<Button onclick={openNew} class="rounded-full bg-brand font-bold text-white hover:bg-brand">
				<Plus class="size-4" /> آدرس جدید
			</Button>
		{/if}
	</div>

	{#if loading}
		<div class="mt-6 grid gap-3 md:grid-cols-2">
			<Skeleton class="h-32 rounded-3xl" />
			<Skeleton class="h-32 rounded-3xl" />
			<Skeleton class="h-32 rounded-3xl" />
			<Skeleton class="h-32 rounded-3xl" />
		</div>
	{:else}
		{#if editingId !== null}
			<Reveal class="mt-4">
				<FormCard title={editingId === 'new' ? 'آدرس جدید' : 'ویرایش آدرس'} subtitle="دقیق بنویس تا بسته گم نشه" icon={MapPin}>
						<form onsubmit={save} class="flex flex-col gap-3" dir="rtl">
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
									<Input bind:value={receiverMobile} inputmode="tel" class="tick rounded-xl text-center" />
								</div>
							</div>
							<div class="flex flex-col gap-1.5">
								<Label>کد پستی (اختیاری)</Label>
								<Input bind:value={postalCode} inputmode="numeric" class="tick rounded-xl" />
							</div>
							<div class="flex gap-2">
								<Button type="submit" disabled={saving} class="rounded-full bg-brand px-8 font-bold text-white hover:bg-brand">
									{saving ? '...' : editingId === 'new' ? 'ذخیره آدرس' : 'به‌روزرسانی'}
								</Button>
								<Button type="button" variant="outline" onclick={() => (editingId = null)} class="rounded-full">انصراف</Button>
							</div>
						</form>
				</FormCard>
			</Reveal>
		{/if}

		<div class="mt-4 grid gap-3 md:grid-cols-2">
			{#each addresses as a (a.id)}
				<Reveal>
					<Card.Root class="h-full rounded-3xl {a.is_default ? 'border-brand/50' : ''}">
						<Card.Content class="flex h-full flex-col gap-2 p-4">
							<div class="flex items-center justify-between">
								<span class="flex items-center gap-1.5 text-sm font-extrabold">
									<MapPin class="size-4 text-brand-dark dark:text-brand" />
									{a.receiver_name} <span class="tick font-normal text-stone-500 dark:text-slate-400">{faDigits(a.receiver_mobile)}</span>
								</span>
								{#if a.is_default}
									<Badge class="rounded-full border-0 bg-brand/10 text-xs font-bold text-brand-dark dark:text-brand">پیش‌فرض ✓</Badge>
								{/if}
							</div>
							<p class="text-sm leading-7 text-stone-600 dark:text-slate-300">{a.province}، {a.city} — {a.address}</p>
							{#if a.postal_code}
								<p class="tick text-xs text-stone-400 dark:text-slate-500">کد پستی: {faDigits(a.postal_code)}</p>
							{/if}
							<div class="mt-auto flex items-center gap-1 pt-2 text-xs font-bold">
								{#if !a.is_default}
									<button type="button" onclick={() => setDefault(a.id)} class="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-brand-dark transition-colors hover:bg-brand/10 dark:text-brand">
										<Star class="size-3.5" /> پیش‌فرض
									</button>
								{/if}
								<button type="button" onclick={() => openEdit(a)} class="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-stone-500 transition-colors hover:bg-stone-100 dark:hover:bg-white/10">
									<Pencil class="size-3.5" /> ویرایش
								</button>
								<button type="button" onclick={() => remove(a.id)} class="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10">
									<Trash2 class="size-3.5" /> حذف
								</button>
							</div>
						</Card.Content>
					</Card.Root>
				</Reveal>
			{/each}
		</div>
		{#if addresses.length === 0 && editingId === null}
			<p class="mt-4 rounded-3xl border border-dashed border-stone-300 p-10 text-center text-sm text-stone-500 dark:border-white/15 dark:text-slate-400">
				هنوز آدرسی ثبت نکردی — موقع تسویه هم می‌تونی اضافه کنی
			</p>
		{/if}
	{/if}
</section>
