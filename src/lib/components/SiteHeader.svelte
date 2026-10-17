<script lang="ts">
	import { page } from '$app/state';
	import { fly, fade } from 'svelte/transition';
	import { Moon, Sun, Menu, X, Heart, User, Scale, Search, Truck, ShieldCheck, BadgePercent } from 'lucide-svelte';
	import { compare } from '$lib/stores/compare.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import SearchBox from '$lib/components/SearchBox.svelte';
	import { applyTheme, theme } from '$lib/stores/theme';
	import { auth } from '$lib/stores/auth.svelte';
	import { cart } from '$lib/stores/cart.svelte';
	import { wishlist } from '$lib/stores/wishlist.svelte';
	import { faDigits, toman } from '$lib/format/money';

	const links = [
		{ href: '/', label: 'خانه' },
		{ href: '/products', label: 'کالاها' },
		{ href: '/amazings', label: 'شگفت‌انگیزها' },
		{ href: '/blog', label: 'بلاگ' },
		{ href: '/contact', label: 'تماس' }
	];

	let menuOpen = $state(false);
	let scrolled = $state(false);

	$effect(() => {
		const onScroll = () => {
			scrolled = window.scrollY > 20;
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	$effect(() => {
		void page.url.pathname;
		menuOpen = false;
	});

	$effect(() => {
		if (menuOpen) {
			const prev = document.body.style.overflow;
			document.body.style.overflow = 'hidden';
			const onKey = (e: KeyboardEvent) => {
				if (e.key === 'Escape') menuOpen = false;
			};
			window.addEventListener('keydown', onKey);
			return () => {
				document.body.style.overflow = prev;
				window.removeEventListener('keydown', onKey);
			};
		}
	});
</script>

<!-- announcement strip: electric → royal with stripe pattern -->
<div class="relative overflow-hidden bg-gradient-to-l from-[#3B46F2] via-[#2635D9] to-[#1B2452] text-white">
	<div class="pattern-stripes absolute inset-0 opacity-60"></div>
	<div class="relative mx-auto flex max-w-7xl items-center justify-center gap-4 px-4 py-2 text-[12px] font-bold">
		<span class="hidden items-center gap-1.5 sm:flex"><Truck class="size-3.5" /> ارسال به سراسر کشور</span>
		<span class="hidden h-3 w-px bg-white/30 sm:block"></span>
		<span class="flex items-center gap-1.5"><BadgePercent class="size-3.5" /> جشنواره جهیزیه — تا ۳۰٪ تخفیف</span>
		<span class="hidden h-3 w-px bg-white/30 md:block"></span>
		<span class="hidden items-center gap-1.5 md:flex"><ShieldCheck class="size-3.5" /> گارانتی شرکتی + ۷ روز مرجوعی</span>
	</div>
</div>

<header
	class="sticky inset-x-0 top-0 z-50 transition-all duration-300 {scrolled
		? 'shadow-[0_12px_40px_rgba(17,17,17,0.35)]'
		: 'shadow-[0_2px_20px_rgba(17,17,17,0.25)]'}"
>
	<!-- main navy bar (overflow visible so the cart dropdown can float over the page) -->
	<div class="navy-surface navy-glow relative">
		<div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
			<div class="pattern-dots absolute inset-0 opacity-[0.35]"></div>
			<div class="absolute -top-10 left-1/4 size-44 rounded-full bg-[#3B46F2]/40 blur-[70px]"></div>
			<div class="absolute -bottom-12 right-1/4 size-44 rounded-full bg-[#2635D9]/50 blur-[70px]"></div>
		</div>

		<div class="relative mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
			<div class="flex items-center gap-2.5">
				<Button
					variant="ghost"
					size="icon-sm"
					onclick={() => (menuOpen = true)}
					aria-label="منو"
					class="rounded-xl border border-white/15 bg-white/10 text-white hover:bg-white/20 hover:text-white"
				>
					<Menu class="size-5" />
				</Button>
				<a href="/" class="group flex items-center gap-2.5">
					<span class="relative flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B46F2] to-[#2635D9] text-xl font-black text-white shadow-[0_8px_24px_rgba(59,70,242,0.55)] ring-1 ring-white/30">
						آ
						<span class="absolute -bottom-1 -left-1 size-3.5 rounded-full border-2 border-[#1B2452] bg-[#F7F8FC]"></span>
					</span>
					<span class="leading-tight">
						<span class="display block text-[20px] font-bold text-white">آرزو<span class="text-[#8B93FF]">.</span></span>
						<span class="block text-[10px] font-bold tracking-wide text-white/60">AREZOU HOME</span>
					</span>
				</a>
			</div>

			<nav class="hidden items-center gap-1 rounded-full border border-white/12 bg-white/[0.07] p-1 backdrop-blur-md md:flex">
				{#each links as l}
					{@const active = page.url.pathname === l.href}
					<a
						href={l.href}
						class="rounded-full px-4 py-1.5 text-[13px] transition-all {active
							? 'bg-white font-black text-[#1B2452] shadow-[0_4px_14px_rgba(0,0,0,0.25)]'
							: 'font-bold text-white/75 hover:bg-white/10 hover:text-white'}"
					>
						{l.label}
					</a>
				{/each}
			</nav>

			<div class="hidden w-60 lg:block">
				<SearchBox
					inputClass="h-10 rounded-2xl border-white/15 bg-white/10 pr-10 text-[13px] text-white placeholder:text-white/50 backdrop-blur-md focus:border-white/40 focus:bg-white/15"
				/>
			</div>

			<div class="flex items-center gap-1.5">
				<Button
					href="/compare"
					variant="ghost"
					size="icon-sm"
					aria-label="مقایسه"
					class="relative rounded-xl text-white/85 hover:bg-white/10 hover:text-white"
				>
					<Scale class="size-4" />
					{#if compare.count > 0}
						<span class="tick absolute -top-1 -left-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#3B46F2] px-0.5 text-[10px] font-bold text-white ring-2 ring-[#1B2452]">{faDigits(compare.count)}</span>
					{/if}
				</Button>
				<Button
					href="/account/wishlist"
					variant="ghost"
					size="icon-sm"
					aria-label="علاقه‌مندی‌ها"
					class="relative rounded-xl text-white/85 hover:bg-white/10 hover:text-white"
				>
					<Heart class="size-4" />
					{#if wishlist.count > 0}
						<span class="tick absolute -top-1 -left-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-0.5 text-[10px] font-bold text-white ring-2 ring-[#1B2452]">{faDigits(wishlist.count)}</span>
					{/if}
				</Button>
				<Button
					variant="ghost"
					size="icon-sm"
					onclick={() => applyTheme($theme === 'dark' ? 'light' : 'dark')}
					aria-label="تغییر تم"
					class="rounded-xl text-white/85 hover:bg-white/10 hover:text-white"
				>
					{#if $theme === 'dark'}
						<Sun class="size-4" />
					{:else}
						<Moon class="size-4" />
					{/if}
				</Button>
				{#if auth.loggedIn}
					<Button href="/account" size="sm" class="hidden rounded-2xl border border-white/20 bg-white/10 font-bold text-white hover:bg-white/20 hover:text-white sm:inline-flex">
						<User class="size-4" /> حساب من
					</Button>
				{:else}
					<Button href="/login" size="sm" class="hidden rounded-2xl border border-white/20 bg-white/10 font-bold text-white hover:bg-white/20 hover:text-white sm:inline-flex">
						ورود
					</Button>
				{/if}
				<div class="group/cart relative">
					<Button href="/cart" size="sm" class="btn-electric relative rounded-2xl border-0 font-black">
						سبد
						{#if cart.count > 0}
							<span class="tick badge-pulse absolute -top-2 -left-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-black text-[#1B2452] shadow">{faDigits(cart.count)}</span>
						{/if}
					</Button>
					<div
						class="invisible absolute left-0 top-full z-50 mt-3 w-80 translate-y-1 rounded-3xl border border-[#E2E6F3] bg-white p-3 opacity-0 shadow-[0_24px_60px_rgba(27,36,82,0.25)] transition-all group-hover/cart:visible group-hover/cart:translate-y-0 group-hover/cart:opacity-100 group-focus-within/cart:visible group-focus-within/cart:translate-y-0 group-focus-within/cart:opacity-100 dark:border-white/10 dark:bg-[#1B2452]"
						dir="rtl"
					>
						{#if cart.items.length === 0}
							<div class="py-6 text-center">
								<div class="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#F7F8FC] text-[#3B46F2] dark:bg-white/10">🛒</div>
								<p class="mt-2 text-sm font-black text-[#1B2452] dark:text-white">سبدت خالیه</p>
								<p class="mt-1 text-xs text-slate-500">یه نگاهی به ویترین بنداز</p>
								<Button href="/products" size="sm" class="btn-electric mt-3 rounded-full border-0">دیدن کالاها</Button>
							</div>
						{:else}
							<div class="thin-scroll flex max-h-72 flex-col gap-2 overflow-y-auto">
								{#each cart.items.slice(0, 4) as item (item.key)}
									<div class="flex items-center gap-3 rounded-2xl bg-[#F7F8FC] p-2 dark:bg-white/[0.06]">
										{#if item.image}
											<img src={item.image} alt={item.name} width="48" height="48" loading="lazy" decoding="async" class="h-12 w-12 rounded-xl bg-white object-cover" />
										{/if}
										<div class="min-w-0 flex-1">
											<p class="truncate text-xs font-bold text-[#1B2452] dark:text-white">{item.name}</p>
											<p class="tick text-[11px] text-slate-500">{faDigits(item.qty)} × {toman(item.price)}</p>
										</div>
										<span class="tick text-xs font-black text-[#2635D9] dark:text-[#8B93FF]">{toman(item.price * item.qty)}</span>
									</div>
								{/each}
								{#if cart.items.length > 4}
									<p class="text-center text-[11px] text-slate-500">+{faDigits(cart.items.length - 4)} کالای دیگر</p>
								{/if}
							</div>
							<div class="mt-3 flex items-center justify-between border-t border-[#E2E6F3] pt-3 dark:border-white/10">
								<span class="text-xs font-bold text-slate-500">جمع:</span>
								<span class="font-toman text-sm font-black text-[#1B2452] dark:text-white">{toman(cart.total)}</span>
							</div>
							<div class="mt-3 grid grid-cols-2 gap-2">
								<Button href="/cart" variant="outline" size="sm" class="rounded-full">سبد</Button>
								<Button href="/checkout" size="sm" class="btn-electric rounded-full border-0">تسویه</Button>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- secondary row: search on mobile + quick cats -->
		<div class="relative border-t border-white/10 bg-black/20">
			<div class="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-2 thin-scroll">
				<span class="hidden shrink-0 items-center gap-1 text-[11px] font-bold text-white/50 md:flex"><Search class="size-3" /> جستجوی سریع:</span>
				{#each [{h:'/products?in_stock=1',l:'کالاهای موجود'},{h:'/amazings',l:'شگفت‌انگیزها'},{h:'/products',l:'یخچال'},{h:'/products',l:'لباسشویی'},{h:'/products',l:'تلویزیون'},{h:'/blog',l:'راهنمای خرید'}] as q}
					<a href={q.h} class="shrink-0 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-[11px] font-bold text-white/75 transition-colors hover:border-[#3B46F2] hover:bg-[#3B46F2] hover:text-white">{q.l}</a>
				{/each}
			</div>
		</div>
	</div>
</header>

{#if menuOpen}
	<div
		class="fixed inset-0 z-[70] bg-[#111111]/60 backdrop-blur-sm"
		role="presentation"
		onclick={() => (menuOpen = false)}
		transition:fade={{ duration: 200 }}
	></div>
	<aside
		class="navy-surface fixed top-0 right-0 z-[71] flex h-full w-80 flex-col overflow-hidden p-5 shadow-2xl"
		transition:fly={{ x: 300, duration: 280 }}
		dir="rtl"
	>
		<div class="pattern-dots absolute inset-0 opacity-30"></div>
		<div class="relative flex items-center justify-between">
			<span class="flex items-center gap-2">
				<span class="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B46F2] to-[#2635D9] font-black text-white">آ</span>
				<span class="display text-xl text-white">آرزو<span class="text-[#8B93FF]">.</span></span>
			</span>
			<Button variant="ghost" size="icon-sm" onclick={() => (menuOpen = false)} aria-label="بستن" class="rounded-xl text-white hover:bg-white/10 hover:text-white">
				<X class="size-5" />
			</Button>
		</div>
		<div class="relative mt-5">
			<SearchBox placeholder="جستجوی کالا…" inputClass="h-11 rounded-2xl border-white/15 bg-white/10 pr-10 text-white placeholder:text-white/50" onnavigate={() => (menuOpen = false)} />
		</div>
		<nav class="relative mt-4 flex flex-col gap-1.5">
			{#each links as l}
				{@const active = page.url.pathname === l.href}
				<a
					href={l.href}
					class="rounded-2xl px-4 py-3 text-sm font-bold transition-all {active
						? 'bg-white font-black text-[#1B2452]'
						: 'border border-white/10 bg-white/[0.06] text-white/85 hover:bg-white/12 hover:text-white'}"
				>
					{l.label}
				</a>
			{/each}
		</nav>
		<div class="relative mt-4 rounded-2xl border border-white/12 bg-gradient-to-l from-[#3B46F2] to-[#2635D9] p-4">
			<div class="pattern-stripes absolute inset-0 rounded-2xl opacity-50"></div>
			<p class="relative text-[13px] font-black text-white">جشنواره جهیزیه فعاله 🎉</p>
			<p class="relative mt-1 text-[11px] text-white/75">تا ۳۰٪ تخفیف + ارسال رایگان</p>
		</div>
		<div class="relative mt-auto flex flex-col gap-2">
			{#if auth.loggedIn}
				<Button href="/account" class="btn-electric w-full rounded-2xl border-0">حساب من</Button>
			{:else}
				<Button href="/login" class="btn-electric w-full rounded-2xl border-0">ورود / ثبت‌نام</Button>
			{/if}
		</div>
	</aside>
{/if}
