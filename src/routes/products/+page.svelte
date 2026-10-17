<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { navigating } from '$app/state';
	import { fly, fade } from 'svelte/transition';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import PriceRange from '$lib/components/PriceRange.svelte';
	import { SlidersHorizontal, X } from 'lucide-svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import SearchableSelect from '$lib/components/SearchableSelect.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { faDigits } from '$lib/format/money';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let search = $state(data.query.search ?? '');
	let sort = $state(data.query.sort ?? 'newest');
	let inStock = $state(data.query.in_stock === '1');
	let minPrice = $state(data.query.min_price ?? '');
	let maxPrice = $state(data.query.max_price ?? '');
	let filterOpen = $state(false);

	const activeFilterCount = $derived(
		[data.query.category_id, data.query.brand_id, data.query.search, minPrice, maxPrice, inStock ? '1' : ''].filter(Boolean).length
	);

	const sorts = [
		{ value: 'newest', label: 'جدیدترین' },
		{ value: 'cheapest', label: 'ارزان‌ترین' },
		{ value: 'expensive', label: 'گران‌ترین' }
	];

	let timer: ReturnType<typeof setTimeout>;
	function push(params: Record<string, string>, immediate = false) {
		if (!browser) return;
		clearTimeout(timer);
		timer = setTimeout(
			() => {
				const merged: Record<string, string> = { ...data.query, ...params };
				delete merged.page;
				const qs = new URLSearchParams();
				for (const [k, v] of Object.entries(merged)) {
					if (v) qs.set(k, v);
				}
				goto(`/products?${qs}`, { keepFocus: true, noScroll: true });
			},
			immediate ? 0 : 400
		);
	}

	$effect(() => {
		const q = data.query;
		search = q.search ?? '';
		sort = q.sort ?? 'newest';
		inStock = q.in_stock === '1';
		minPrice = q.min_price ?? '';
		maxPrice = q.max_price ?? '';
	});

	$effect(() => {
		void data.query;
		filterOpen = false;
	});
</script>

<SeoHead
	title="کالاها"
	description="لیست کالاهای فروشگاه آرزو با فیلتر برند، دسته و قیمت — خرید یخچال، لباسشویی، ظرفشویی و لوازم آشپزخانه با گارانتی شرکتی"
	image="/images/hero-real-1.webp"
/>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape' && filterOpen) filterOpen = false; }} />

<!-- page hero strip -->
<section class="relative overflow-hidden px-4 pt-10 pb-6">
	<div class="hero-wash hero-wash-a" style="width:380px;height:280px;top:-120px;left:10%"></div>
	<div class="relative mx-auto max-w-7xl">
		<Reveal>
			<h1 class="display text-3xl text-[#1B2452] md:text-4xl dark:text-white">ویترین <span class="text-gradient-electric">کالاها</span></h1>
			<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
				<span class="tick font-black text-[#2635D9] dark:text-[#8B93FF]">{faDigits(data.result.meta.total)}</span> کالا
				{#if data.query.search} برای «{data.query.search}»{/if}
			</p>
		</Reveal>
	</div>
</section>

<section class="mx-auto max-w-7xl px-4 pb-14">
	<!-- category chips: quick access, scrollable on mobile/tablet -->
	<nav class="mb-4 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="دسته‌بندی‌ها">
		<a
			href="/products"
			aria-current={!data.query.category_id ? 'page' : undefined}
			class="shrink-0 rounded-full border px-4 py-1.5 text-xs font-black whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B46F2] {!data.query.category_id
				? 'border-transparent bg-gradient-to-l from-[#3B46F2] to-[#2635D9] text-white shadow-[0_8px_20px_rgba(59,70,242,0.4)]'
				: 'border-[#E2E6F3] bg-white text-slate-600 hover:border-[#3B46F2]/50 hover:text-[#2635D9] dark:border-white/15 dark:bg-white/5 dark:text-slate-300'}"
		>
			همه
		</a>
		{#each data.categories as c (c.id)}
			<a
				href="/products?category_id={c.id}"
				aria-current={String(data.query.category_id) === String(c.id) ? 'page' : undefined}
				class="shrink-0 rounded-full border px-4 py-1.5 text-xs font-black whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B46F2] {String(data.query.category_id) === String(c.id)
					? 'border-transparent bg-gradient-to-l from-[#3B46F2] to-[#2635D9] text-white shadow-[0_8px_20px_rgba(59,70,242,0.4)]'
					: 'border-[#E2E6F3] bg-white text-slate-600 hover:border-[#3B46F2]/50 hover:text-[#2635D9] dark:border-white/15 dark:bg-white/5 dark:text-slate-300'}"
			>
				{c.title}
			</a>
		{/each}
	</nav>

	<!-- mobile filter trigger -->
	<div class="mb-3 flex items-center justify-between lg:hidden">
		<Button
			variant="outline"
			size="sm"
			onclick={() => (filterOpen = true)}
			aria-label="باز کردن فیلترها"
			aria-expanded={filterOpen}
			aria-controls="filter-drawer"
			class="rounded-full border-[#E2E6F3] bg-white font-black text-[#1B2452] dark:border-white/15 dark:bg-white/5 dark:text-white"
		>
			<SlidersHorizontal class="size-4 text-[#3B46F2]" />
			فیلتر
			{#if activeFilterCount > 0}
				<Badge class="tick border-0 bg-[#3B46F2] px-1.5 font-black text-white hover:bg-[#3B46F2]">{faDigits(activeFilterCount)}</Badge>
			{/if}
		</Button>
		<span class="tick text-xs font-bold text-slate-500 dark:text-slate-400">{faDigits(data.result.meta.total)} کالا</span>
	</div>

	<!-- desktop filter panel -->
	<div class="hidden lg:block">
		<Reveal>
			<Card.Root class="card-brand overflow-hidden py-0">
				<div class="h-1.5 bg-gradient-to-l from-[#3B46F2] via-[#2635D9] to-[#3B46F2]"></div>
				<div class="flex items-center gap-2.5 px-4 pt-3.5 md:px-5">
					<span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B46F2] to-[#2635D9] text-white shadow-[0_8px_20px_rgba(59,70,242,0.4)]">
						<SlidersHorizontal class="size-4" />
					</span>
					<span class="display text-[15px] font-bold text-[#1B2452] dark:text-white">فیلترها</span>
					<span class="ms-auto flex items-center gap-2">
						<span class="tick text-xs font-bold text-slate-500 dark:text-slate-400">{faDigits(data.result.meta.total)} کالا</span>
						{#if activeFilterCount > 0}
							<Badge class="tick border-0 bg-[#3B46F2] font-black text-white hover:bg-[#3B46F2]">{faDigits(activeFilterCount)} فعال</Badge>
							<Button href="/products" variant="ghost" size="sm" class="h-7 rounded-full px-2.5 font-bold text-red-500 hover:bg-red-500/10 hover:text-red-600">
								<X class="size-3.5" /> حذف همه
							</Button>
						{/if}
					</span>
				</div>
				<Card.Content class="flex flex-col gap-3 p-4 pt-3 md:p-5 md:pt-3">
					<Separator />
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1.6fr]">
						<div>
							<label for="search-desktop" class="mb-1.5 block text-xs font-black text-[#1B2452] dark:text-slate-200">جستجو</label>
							<div class="relative">
								<Input
									id="search-desktop"
									bind:value={search}
									oninput={() => push({ search })}
									placeholder="یخچال، سشوار، قابلمه…"
									aria-label="جستجوی کالا"
									class="rounded-xl border-[#E2E6F3] bg-[#F7F8FC] pr-10 focus-visible:ring-[#3B46F2] dark:border-white/15 dark:bg-white/5"
								/>
								<span class="absolute top-1/2 right-3 -translate-y-1/2 text-[#3B46F2] dark:text-[#8B93FF]" aria-hidden="true">⌕</span>
							</div>
						</div>
						<SearchableSelect
							label="دسته‌بندی"
							placeholder="همه دسته‌ها"
							options={[{ value: '', label: 'همه دسته‌ها' }, ...data.categories.map((c) => ({
								value: String(c.id),
								label: c.title
							}))]}
							value={data.query.category_id ?? ''}
							onselect={(v) => push({ category_id: v }, true)}
						/>
						<SearchableSelect
							label="برند"
							placeholder="همه برندها"
							options={[{ value: '', label: 'همه برندها' }, ...data.brands.map((b) => ({
								value: String(b.id),
								label: b.name
							}))]}
							value={data.query.brand_id ?? ''}
							onselect={(v) => push({ brand_id: v }, true)}
						/>
						<div class="rounded-2xl border border-[#E2E6F3] bg-[#F7F8FC] p-3 dark:border-white/10 dark:bg-white/[0.03]">
							<div class="mb-2 text-xs font-black text-[#1B2452] dark:text-slate-200">محدوده قیمت</div>
							<PriceRange bind:min={minPrice} bind:max={maxPrice} onchange={() => push({ min_price: minPrice, max_price: maxPrice })} />
						</div>
					</div>
					<Separator />
					<div class="flex flex-wrap items-center gap-2">
						<span class="text-xs font-black text-[#1B2452] dark:text-slate-200">مرتب‌سازی:</span>
						{#each sorts as s}
							<Button
								size="sm"
								variant={sort === s.value ? 'default' : 'outline'}
								onclick={() => {
									sort = s.value;
									push({ sort: s.value }, true);
								}}
								aria-pressed={sort === s.value}
								class={sort === s.value
									? 'btn-electric rounded-full border-0 font-black'
									: 'rounded-full border-[#E2E6F3] bg-transparent hover:border-[#3B46F2]/50 hover:text-[#2635D9] dark:border-white/15'}
							>
								{s.label}
							</Button>
						{/each}
						<Separator orientation="vertical" class="mx-1 h-6" />
						<Button
							size="sm"
							variant="outline"
							onclick={() => {
								inStock = !inStock;
								push({ in_stock: inStock ? '1' : '' }, true);
							}}
							aria-pressed={inStock}
							class={inStock
								? 'rounded-full border-emerald-500 bg-emerald-500 font-black text-white shadow-[0_8px_20px_rgba(16,185,129,0.4)] hover:bg-emerald-500 hover:text-white'
								: 'rounded-full border-[#E2E6F3] bg-transparent hover:border-emerald-500/60 hover:text-emerald-600 dark:border-white/15'}
						>
							{inStock ? '✓ فقط موجودها' : '○ فقط موجودها'}
						</Button>
					</div>
				</Card.Content>
			</Card.Root>
		</Reveal>
	</div>

	<!-- mobile filter drawer -->
	{#if filterOpen}
		<div
			class="fixed inset-0 z-[70] bg-stone-900/50 backdrop-blur-sm lg:hidden"
			role="presentation"
			onclick={() => (filterOpen = false)}
			transition:fade={{ duration: 180 }}
		></div>
		<aside
			id="filter-drawer"
			role="dialog"
			aria-modal="true"
			aria-label="فیلترها"
			class="fixed inset-y-0 right-0 z-[71] flex w-[88%] max-w-sm flex-col overflow-y-auto bg-[#F7F8FC] p-4 shadow-2xl lg:hidden dark:bg-ink"
			transition:fly={{ x: 320, duration: 260 }}
			dir="rtl"
		>
			<div class="flex items-center justify-between">
				<span class="flex items-center gap-2.5">
					<span class="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B46F2] to-[#2635D9] text-white shadow-[0_8px_20px_rgba(59,70,242,0.4)]">
						<SlidersHorizontal class="size-4" />
					</span>
					<span>
						<h2 class="display text-base font-bold text-[#1B2452] dark:text-white">فیلترها</h2>
						{#if activeFilterCount > 0}
							<span class="tick text-[11px] font-bold text-[#2635D9] dark:text-[#8B93FF]">{faDigits(activeFilterCount)} فیلتر فعال</span>
						{/if}
					</span>
				</span>
				<Button variant="ghost" size="icon-sm" onclick={() => (filterOpen = false)} aria-label="بستن فیلترها" class="rounded-full">
					<X class="size-5" />
				</Button>
			</div>
			<div class="mt-4 flex flex-col gap-4">
				<div>
					<label for="search-mobile" class="mb-1.5 block text-xs font-black text-[#1B2452] dark:text-slate-200">جستجو</label>
					<Input
						id="search-mobile"
						bind:value={search}
						oninput={() => push({ search })}
						placeholder="یخچال، سشوار…"
						aria-label="جستجوی کالا"
						class="rounded-xl border-[#E2E6F3] bg-white focus-visible:ring-[#3B46F2] dark:border-white/15 dark:bg-white/5"
					/>
				</div>
				<SearchableSelect
					label="دسته‌بندی"
					placeholder="همه دسته‌ها"
					options={[{ value: '', label: 'همه دسته‌ها' }, ...data.categories.map((c) => ({
						value: String(c.id),
						label: c.title
					}))]}
					value={data.query.category_id ?? ''}
					onselect={(v) => push({ category_id: v }, true)}
				/>
				<SearchableSelect
					label="برند"
					placeholder="همه برندها"
					options={[{ value: '', label: 'همه برندها' }, ...data.brands.map((b) => ({
						value: String(b.id),
						label: b.name
					}))]}
					value={data.query.brand_id ?? ''}
					onselect={(v) => push({ brand_id: v }, true)}
				/>
				<div class="rounded-2xl border border-[#E2E6F3] bg-white p-3 dark:border-white/10 dark:bg-white/[0.03]">
					<PriceRange bind:min={minPrice} bind:max={maxPrice} onchange={() => push({ min_price: minPrice, max_price: maxPrice })} />
				</div>
				<div class="flex flex-wrap gap-2">
					{#each sorts as s}
						<Button
							size="sm"
							variant={sort === s.value ? 'default' : 'outline'}
							onclick={() => {
								sort = s.value;
								push({ sort: s.value }, true);
							}}
							aria-pressed={sort === s.value}
							class={sort === s.value
								? 'btn-electric rounded-full border-0 font-black'
								: 'rounded-full border-[#E2E6F3] bg-transparent dark:border-white/15'}
						>
							{s.label}
						</Button>
					{/each}
					<Button
						size="sm"
						variant="outline"
						onclick={() => {
							inStock = !inStock;
							push({ in_stock: inStock ? '1' : '' }, true);
						}}
						aria-pressed={inStock}
						class={inStock
							? 'rounded-full border-emerald-500 bg-emerald-500 font-black text-white hover:bg-emerald-500 hover:text-white'
							: 'rounded-full border-[#E2E6F3] bg-transparent dark:border-white/15'}
					>
						{inStock ? '✓ فقط موجودها' : '○ فقط موجودها'}
					</Button>
				</div>
				{#if data.query.category_id || data.query.brand_id || data.query.search || minPrice || maxPrice || inStock}
					<a
						href="/products"
						class="text-center text-xs text-stone-500 underline-offset-4 hover:text-red-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:text-slate-500"
					>
						حذف همه فیلترها ✕
					</a>
				{/if}
			</div>
			<div class="sticky bottom-0 mt-6 flex gap-2 bg-[#F7F8FC] pt-4 dark:bg-ink">
				<Button onclick={() => (filterOpen = false)} class="btn-electric flex-1 rounded-full border-0 font-bold">اعمال</Button>
				<Button variant="outline" href="/products" class="rounded-full border-[#E2E6F3] dark:border-white/15">پاک کردن</Button>
			</div>
		</aside>
	{/if}

	<!-- grid -->
	{#if navigating.to}
		<div class="mt-6 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
			{#each Array(8) as _}
				<Skeleton class="h-72 rounded-3xl bg-white/5" />
			{/each}
		</div>
	{:else if data.result.data.length === 0}
		<div class="mt-6 rounded-3xl border border-dashed border-[#3B46F2]/40 bg-white p-12 text-center dark:border-white/15 dark:bg-transparent">
			<img src="/vectors/shopping-cart.svg" alt="" width="72" height="72" class="mx-auto w-[72px] text-slate-300 dark:text-slate-600" />
			<p class="mt-3 text-sm font-bold text-slate-500 dark:text-slate-400">چیزی پیدا نشد — فیلترها رو شل‌تر کن 😉</p>
			<a href="/products" class="btn-electric mt-4 inline-block rounded-full border-0 px-5 py-2 text-xs font-black">
				دیدن همه کالاها
			</a>
		</div>
	{:else}
		<div class="mt-6 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
			{#each data.result.data as p, i (p.id)}
				<ProductCard product={p} delay={i} />
			{/each}
		</div>
		<div class="mt-8 flex items-center justify-center gap-4 text-sm" dir="rtl">
			{#if data.result.meta.current_page > 1}
				<a
					href="/products?{new URLSearchParams(Object.fromEntries(Object.entries({ ...data.query, page: String(data.result.meta.current_page - 1) }).filter(([, v]) => v != null && String(v) !== '')))}"
					class="rounded-full border border-[#E2E6F3] bg-white px-5 py-2 font-bold hover:border-[#3B46F2] hover:text-[#2635D9] dark:border-white/15 dark:bg-transparent dark:hover:text-[#8B93FF]"
				>
					قبلی
				</a>
			{/if}
			<span class="tick text-slate-500 dark:text-slate-400">
				<bdi>{faDigits(data.result.meta.current_page)}</bdi> از <bdi>{faDigits(data.result.meta.last_page)}</bdi>
			</span>
			{#if data.result.meta.current_page < data.result.meta.last_page}
				<a
					href="/products?{new URLSearchParams(Object.fromEntries(Object.entries({ ...data.query, page: String(data.result.meta.current_page + 1) }).filter(([, v]) => v != null && String(v) !== '')))}"
					class="rounded-full border border-[#E2E6F3] bg-white px-5 py-2 font-bold hover:border-[#3B46F2] hover:text-[#2635D9] dark:border-white/15 dark:bg-transparent dark:hover:text-[#8B93FF]"
				>
					بعدی
				</a>
			{/if}
		</div>
	{/if}
</section>
