<script lang="ts">
	import { onMount } from 'svelte';
	import CountUp from '$lib/components/CountUp.svelte';
	import MagneticButton from '$lib/components/MagneticButton.svelte';
	import Marquee from '$lib/components/Marquee.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import HomeSlider from '$lib/components/HomeSlider.svelte';
	import ForYou from '$lib/components/ForYou.svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import BlogCard from '$lib/components/BlogCard.svelte';
	import { fileUrl, srcSet } from '$lib/api/files';
	import { api } from '$lib/api/client';
	import type { Product, Paginated } from '$lib/api/types';
	import { recent } from '$lib/stores/recent.svelte';
	import { toman } from '$lib/format/money';
	import { faDigits } from '$lib/format/money';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { orgJsonLd, websiteJsonLd } from '$lib/seo/seo';
	import { page } from '$app/state';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const origin = $derived(page.url.origin);
	const headJsonLd = $derived([orgJsonLd(origin), websiteJsonLd(origin)]);

	const brandNames = $derived(data.brands.map((b) => b.name));
	const storeName = $derived(data.settings.store_name || 'آرزو');

	const catPhotos: Record<string, string> = {
		'لوازم-برقی-بزرگ': '/images/cat-big.webp',
		'صوتی-و-تصویری': '/images/cat-tv.webp',
		'لوازم-برقی-کوچک-آشپزخانه': '/images/cat-small.webp',
		'نظافت-برقی': '/images/cat-clean.webp',
		'زیبایی-و-سلامت-برقی': '/images/cat-beauty.webp',
		'پنکه-و-تهویه': '/images/cat-fan.webp',
		'ظروف-پخت‌وپز': '/images/cat-cook.webp',
		'ظروف-سرو-و-پذیرایی': '/images/cat-dinner.webp'
	};
	const cardShapes = ['shape-arch', 'shape-blob', 'shape-circle', 'shape-leaf'];
	const faNum = (n: number) => n.toLocaleString('fa-IR');

	function catPhoto(cat: { image?: string | null; slug: string }): string | null {
		return fileUrl(cat.image) ?? catPhotos[cat.slug] ?? null;
	}

	const featured = $derived(data.featured);
	const hot = $derived(data.amazings[0] ?? null);
	const topCat = $derived(data.categories[0] ?? null);

	let now = $state(Date.now());
	let heroIndex = $state(0);
	onMount(() => {
		const t = setInterval(() => (now = Date.now()), 1000);
		const h = setInterval(() => {
			heroIndex = (heroIndex + 1) % heroSlides.length;
		}, 5000);
		return () => {
			clearInterval(t);
			clearInterval(h);
		};
	});
	const remain = $derived.by(() => {
		if (!hot?.end_at) return null;
		const ms = new Date(hot.end_at).getTime() - now;
		if (ms <= 0) return null;
		const s = Math.floor(ms / 1000);
		return [
			{ v: Math.floor(s / 86400), l: 'روز' },
			{ v: Math.floor((s % 86400) / 3600), l: 'ساعت' },
			{ v: Math.floor((s % 3600) / 60), l: 'دقیقه' },
			{ v: s % 60, l: 'ثانیه' }
		];
	});
	const fa2 = (n: number) => faDigits(String(n).padStart(2, '0'));
	const dbSlides = $derived((data.sliders[0]?.slides ?? []).filter((s) => s.image));
	// Static fallback banners (optimized WebP, 640→1600w variants in /static/images).
	// 1 = fridges showroom, 2 = washing machines, 3 = TV living room.
	const staticSrcSet = (base: string) => {
		const dot = base.lastIndexOf('.');
		const stem = base.slice(0, dot);
		const ext = base.slice(dot);
		return `${stem}-640${ext} 640w, ${stem}-960${ext} 960w, ${stem}-1280${ext} 1280w, ${stem}-1600${ext} 1600w`;
	};
	const heroSrcSet = (img: string) =>
		srcSet(img, [640, 960, 1280]) ??
		(img.startsWith('/images/hero-banner-') ? staticSrcSet(img) : null);
	const heroSlides = $derived(
		dbSlides.length > 0
			? dbSlides.map((s) => ({
					image: s.image ?? '',
					title: s.title ?? '',
					description: s.description ?? '',
					link: s.link ?? s.button_link ?? '/products',
					button_title: s.button_title ?? 'مشاهده'
				}))
			: [
					{ image: '/images/hero-banner-1.webp', title: 'یخچال ساید و دوقلو', description: 'تازه مثل روز اول', link: '/products', button_title: 'مشاهده یخچال‌ها' },
					{ image: '/images/hero-banner-2.webp', title: 'لباسشویی کم‌مصرف', description: 'تمیز، بی‌صدا، هوشمند', link: '/products', button_title: 'دیدن لباسشویی‌ها' },
					{ image: '/images/hero-banner-3.webp', title: 'سینما تو خونه‌ته', description: 'تلویزیون‌های 4K', link: '/products', button_title: 'مشاهده تلویزیون‌ها' }
				]
	);

	let recentProducts = $state<Product[]>([]);

	onMount(() => {
		const ids = recent.ids;
		if (ids.length === 0) return;
		api<Paginated<Product>>(`/products?ids=${ids.join(',')}`)
			.then((r) => {
				const map = new Map(r.data.map((p) => [p.id, p]));
				recentProducts = ids.map((id) => map.get(id)).filter(Boolean) as Product[];
			})
			.catch(() => {});
	});
</script>

<SeoHead
	title="خانه"
	description="خرید یخچال، لباسشویی، ظرفشویی، سشوار، قابلمه و سرویس غذاخوری با گارانتی شرکتی و ارسال به سراسر کشور"
	image="/images/hero-banner-1.webp"
	jsonLd={headJsonLd}
/>
<svelte:head>
	{#if heroSlides[0]}
		<link
			rel="preload"
			as="image"
			href={fileUrl(heroSlides[0].image) ?? '/images/hero-banner-1.webp'}
			imagesrcset={heroSrcSet(heroSlides[0].image) ?? undefined}
			imagesizes="100vw"
			fetchpriority="high"
		/>
	{/if}
</svelte:head>

<!-- HERO : fullwidth slider, inner from layout -->
<section class="relative flex min-h-[74vh] items-center overflow-hidden md:min-h-[78vh]">
	{#each heroSlides as slide, i (slide.image)}
		<div class="absolute inset-0 transition-opacity duration-700 {i === heroIndex ? 'opacity-100' : 'opacity-0'}" aria-hidden={i !== heroIndex}>
			<img
				src={fileUrl(slide.image) ?? '/images/hero-banner-1.webp'}
				srcset={heroSrcSet(slide.image) ?? undefined}
				sizes="100vw"
				alt={slide.title ?? ''}
				width="1600"
				height="902"
				loading={i === 0 ? 'eager' : 'lazy'}
				fetchpriority={i === 0 ? 'high' : 'low'}
				decoding={i === 0 ? 'sync' : 'async'}
				class="h-full w-full object-cover"
			/>
			<div class="absolute inset-0 bg-gradient-to-t from-[#111111]/85 via-[#1B2452]/35 to-transparent"></div>
			<div class="absolute inset-0 bg-gradient-to-l from-[#2635D9]/25 via-transparent to-transparent"></div>
		</div>
	{/each}
	<div class="relative mx-auto flex min-h-[74vh] w-full max-w-7xl items-center px-4 py-16 pt-24 md:min-h-[78vh] md:py-20 md:pt-28">
		<div class="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
			<span class="rounded-full border border-white/25 bg-gradient-to-l from-[#3B46F2] to-[#2635D9] px-4 py-1.5 text-[11px] font-black text-white shadow-[0_8px_24px_rgba(59,70,242,0.5)] backdrop-blur-md">جشنواره جهیزیه • ارسال به سراسر کشور</span>
			<h1 class="display mt-4 max-w-2xl text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]" style="font-size:clamp(2.2rem,5.5vw,3.8rem);line-height:1.15">
				{heroSlides[heroIndex]?.title ?? 'آشپزخانه هوشمند،'}<br />
				<span class="font-black">{heroSlides[heroIndex]?.description ?? 'نتیجه‌ای خوشمزه.'}</span>
			</h1>
			<p class="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/80 md:text-[15px]">
				ترکیب بی‌نظیر سبک، کارایی و کیفیت — با لوازم خانگی آرزو
			</p>
			<div class="mt-6 flex flex-wrap justify-center gap-3">
				<a
					href={heroSlides[heroIndex]?.link ?? '/products'}
					class="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-black text-[#1B2452] shadow-[0_12px_32px_rgba(0,0,0,0.25)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
				>
					{heroSlides[heroIndex]?.button_title ?? 'مشاهده محصولات'}
					<span class="flex size-7 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B46F2] to-[#2635D9] text-white">→</span>
				</a>
				<a
					href="/products?in_stock=1"
					class="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-md hover:bg-white/15"
				>
					کالاهای موجود
				</a>
			</div>
			<div class="mt-6 flex items-center justify-center gap-1.5">
				{#each heroSlides as _, i}
					<button
						type="button"
						aria-label="اسلاید {i + 1}"
						onclick={() => (heroIndex = i)}
						class="h-1.5 rounded-full transition-all {i === heroIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'}"
					></button>
				{/each}
			</div>
		</div>

		<button
			type="button"
			aria-label="اسلاید قبلی"
			onclick={() => (heroIndex = (heroIndex - 1 + heroSlides.length) % heroSlides.length)}
			class="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-3 text-white backdrop-blur-md hover:bg-white/20 md:flex"
		>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6" /></svg>
		</button>
		<button
			type="button"
			aria-label="اسلاید بعدی"
			onclick={() => (heroIndex = (heroIndex + 1) % heroSlides.length)}
			class="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-3 text-white backdrop-blur-md hover:bg-white/20 md:flex"
		>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6" /></svg>
		</button>

		<!-- glass card: useful — shipping + warranty -->
		<div class="absolute bottom-4 right-4 hidden items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 pr-4 backdrop-blur-xl md:flex">
			<div class="flex size-10 items-center justify-center rounded-xl bg-white text-brand">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.34A1 1 0 0 0 17.52 8H14"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
			</div>
			<div class="text-right">
				<div class="text-xs font-black text-white">تحویل فوری • نصب رایگان</div>
				<div class="text-[11px] text-white/70">گارانتی شرکتی • ۷ روز مرجوعی</div>
			</div>
			<div class="h-8 w-px bg-white/15"></div>
			<div class="flex items-center gap-1.5" aria-hidden="true">
				<span class="flex size-7 items-center justify-center rounded-full border-2 border-white/50 bg-white/20 text-xs font-black text-white">آ</span>
				<span class="flex size-7 items-center justify-center rounded-full border-2 border-white/50 bg-white/20 text-xs font-black text-white">ر</span>
			</div>
			<div class="text-xs font-bold text-white">＋{faDigits(12)} میلیون</div>
		</div>

		<a
			href="#cats"
			class="absolute bottom-4 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-[11px] text-white/70 md:flex"
			aria-label="اسکرول"
		>
			<span>اسکرول</span>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6" /></svg>
		</a>
	</div>
</section>



{#if brandNames.length > 0}
	<div class="border-y border-[#1B2452]/10 bg-white/70 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03]">
		<Marquee items={brandNames} class="py-4 text-lg font-black text-[#1B2452]/40 dark:text-slate-400" />
	</div>
{/if}

<!-- CATEGORIES : bento -->
<section id="cats" class="cv-auto mx-auto max-w-7xl scroll-mt-20 px-4 py-12">
	<Reveal>
		<div class="flex items-end justify-between">
			<div>
				<h2 class="display section-title-accent text-2xl text-[#1B2452] md:text-3xl dark:text-white">دسته‌بندی‌ها</h2>
				<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">از یخچال ساید تا قاشق چنگال — همه‌چی سر جاشه</p>
			</div>
			<Button href="/products" variant="outline" size="sm" class="rounded-full border-[#3B46F2]/25 bg-[#3B46F2]/8 font-black text-[#2635D9] hover:bg-[#3B46F2] hover:text-white max-md:hidden dark:text-[#8B93FF]">همه کالاها ←</Button>
		</div>
	</Reveal>
	<div class="mt-6 grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 md:grid-cols-4">
		{#each data.categories as cat, i}
			{@const photo = catPhoto(cat)}
			{#if i === 0}
				<Reveal delay={0} class="col-span-2">
					<a href="/products?category_id={cat.id}" class="group block h-full">
					<Card.Root class="card-brand h-full">
						<div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-[#3B46F2] to-[#2635D9]"></div>
						<div class="relative flex h-full flex-col gap-3 p-6 sm:flex-row sm:items-center">
						<div class="flex flex-1 flex-col justify-center gap-3">
							<Badge class="tick w-fit border-0 bg-[#1B2452] font-black text-white hover:bg-[#1B2452]">{faNum(i + 1)}</Badge>
							<div class="display text-2xl text-[#1B2452] transition-colors group-hover:text-[#2635D9] md:text-3xl dark:text-white dark:group-hover:text-[#8B93FF]">{cat.title}</div>
							<div class="flex flex-wrap gap-1.5">
								{#each (cat.children ?? []).slice(0, 4) as sub}
									<Badge variant="secondary" class="border-[#1B2452]/12 bg-[#F7F8FC] font-bold text-[#1B2452]/70 hover:bg-[#F7F8FC] hover:text-[#1B2452]/70">{sub.title}</Badge>
								{/each}
							</div>
							<span class="mt-1 w-fit"><Button size="sm" class="btn-electric pointer-events-none rounded-full border-0 font-black">مشاهده ←</Button></span>
						</div>
						{#if photo}
							<div class="relative flex items-center justify-center p-6 sm:w-1/2">
								<div class="shape-arch w-full max-w-[240px] overflow-hidden bg-white shadow-lg ring-1 ring-stone-200 dark:ring-white/15">
									<img src={photo} alt={cat.title} width="480" height="480" loading="lazy" decoding="async" srcset={srcSet(cat.image, [320, 480]) ?? undefined} sizes="(max-width: 640px) 50vw, 240px" class="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-108 group-hover:rotate-1" />
								</div>
							</div>
						{/if}
						</div>
					</Card.Root>
					</a>
				</Reveal>
			{:else}
				<Reveal delay={(i % 4) * 80}>
					<a href="/products?category_id={cat.id}" class="group block h-full">
					<Card.Root class="card-brand h-full">
						<Badge class="tick absolute top-3 right-4 z-10 border-0 bg-[#1B2452] font-black text-white hover:bg-[#1B2452]">{faNum(i + 1)}</Badge>
						{#if photo}
							<div class="relative mx-auto mt-7 h-32 w-32 md:h-36 md:w-36">
								<div class="{cardShapes[(i - 1) % cardShapes.length]} h-full w-full overflow-hidden bg-white shadow-md ring-1 ring-stone-200 dark:ring-white/15">
									<img src={photo} alt={cat.title} width="320" height="320" loading="lazy" decoding="async" srcset={srcSet(cat.image, [320]) ?? undefined} sizes="144px" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-2" />
								</div>
							</div>
						{/if}
						<Card.Header class="relative gap-1 p-4 pb-0 text-center">
							<Card.Title class="display text-base text-[#1B2452] transition-colors group-hover:text-[#2635D9] md:text-lg dark:text-white dark:group-hover:text-[#8B93FF]">{cat.title}</Card.Title>
							<Card.Description class="text-[11px] font-bold">
								{cat.children?.length ?? 0} زیر‌دسته <span class="mr-1 inline-block rounded-full bg-[#3B46F2]/10 px-2 py-0.5 text-[#2635D9] transition-transform group-hover:-translate-x-1 dark:text-[#8B93FF]">←</span>
							</Card.Description>
						</Card.Header>
					</Card.Root>
					</a>
				</Reveal>
			{/if}
		{/each}
	</div>
</section>

<!-- WHY US -->
<section class="mx-auto max-w-7xl px-4 pb-6">
	<div class="grid gap-4 md:grid-cols-3">
		{#each [{ t: 'گارانتی شرکتی', d: 'همه کالاهای برقی با گارانتی معتبر و خدمات نصب', e: '🛡️' }, { t: 'قیمت به تومان، شفاف', d: 'بدون هزینه پنهان؛ تخفیف واقعی روی فاکتور', e: '💎' }, { t: 'ارسال به سراسر کشور', d: 'تیپاکس، پیشتاز و باربری برای کالاهای بزرگ', e: '🚚' }] as f, i}
			<Reveal delay={i * 100}>
				<Card.Root class="relative overflow-hidden border-white/10 bg-gradient-to-bl from-[#1B2452] to-[#111111] shadow-[0_16px_44px_rgba(27,36,82,0.3)]">
					<div class="absolute -top-10 -left-10 size-28 rounded-full bg-[#3B46F2]/35 blur-3xl"></div>
					<div class="relative flex items-start gap-3 p-4 md:p-5">
						<span class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B46F2] to-[#2635D9] text-lg shadow-[0_8px_20px_rgba(59,70,242,0.5)]">{f.e}</span>
						<span>
							<Card.Title class="font-extrabold text-white">{f.t}</Card.Title>
							<Card.Description class="mt-1 text-[13px] leading-5 text-white/65">{f.d}</Card.Description>
						</span>
					</div>
					<Card.Footer class="relative pt-0">
						<div class="h-1 w-full overflow-hidden rounded-full bg-white/10">
							<div class="h-full w-1/3 rounded-full bg-gradient-to-l from-[#3B46F2] to-[#2635D9]"></div>
						</div>
					</Card.Footer>
				</Card.Root>
			</Reveal>
		{/each}
	</div>
</section>

<!-- FEATURED PRODUCTS -->
{#if data.featuredProducts.length > 0}
	<section class="cv-auto mx-auto max-w-7xl px-4 pb-6">
		<div class="flex items-end justify-between">
			<h2 class="display section-title-accent text-xl text-[#1B2452] md:text-2xl dark:text-white">محصولات ویژه</h2>
			<Button href="/products" variant="outline" size="sm" class="rounded-full border-[#3B46F2]/25 bg-[#3B46F2]/8 font-black text-[#2635D9] hover:bg-[#3B46F2] hover:text-white dark:text-[#8B93FF]">همه ←</Button>
		</div>
		<div class="mt-4 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 md:gap-4">
			{#each data.featuredProducts as p, i (p.id)}
				<ProductCard product={p} delay={i} />
			{/each}
		</div>
	</section>
{/if}

<!-- RECENTLY VIEWED -->
{#if recentProducts.length > 0}
	<section class="mx-auto max-w-7xl px-4 pb-6">
		<div class="flex items-end justify-between">
			<h2 class="display section-title-accent text-xl text-[#1B2452] md:text-2xl dark:text-white">اخیراً دیده‌اید</h2>
			<Button href="/products" variant="outline" size="sm" class="rounded-full border-[#3B46F2]/25 bg-[#3B46F2]/8 font-black text-[#2635D9] hover:bg-[#3B46F2] hover:text-white dark:text-[#8B93FF]">همه ←</Button>
		</div>
		<div class="mt-4 grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 md:grid-cols-4">
			{#each recentProducts as r}
				<a href="/products/{r.slug}" class="group block">
				<Card.Root class="card-brand">
					<Card.Content class="flex items-center gap-3 p-3">
					{#if fileUrl(r.image)}
						<img src={fileUrl(r.image)} srcset={srcSet(r.image, [320]) ?? undefined} sizes="64px" alt={r.name} width="80" height="80" loading="lazy" decoding="async" class="h-16 w-16 shrink-0 rounded-2xl bg-[#F7F8FC] object-cover dark:bg-white/5" />
					{/if}
					<span class="min-w-0">
						<span class="block truncate text-xs font-bold text-[#1B2452] dark:text-slate-100">{r.name}</span>
						<span class="font-toman mt-1 block text-xs font-black text-[#2635D9] dark:text-[#8B93FF]">{toman(r.final_price_rial)}</span>
					</span>
					</Card.Content>
				</Card.Root>
				</a>
			{/each}
		</div>
	</section>
{:else}
	<div class="pb-6"></div>
{/if}

<ForYou />

{#if data.blogPosts.length > 0}
	<section class="mx-auto max-w-7xl px-4 pb-14">
		<div class="flex items-end justify-between">
			<h2 class="display section-title-accent text-xl text-[#1B2452] md:text-2xl dark:text-white">از بلاگ</h2>
			<Button href="/blog" variant="outline" size="sm" class="rounded-full border-[#3B46F2]/25 bg-[#3B46F2]/8 font-black text-[#2635D9] hover:bg-[#3B46F2] hover:text-white dark:text-[#8B93FF]">همه ←</Button>
		</div>
		<div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.blogPosts as post, i (post.id)}
				<BlogCard post={post} delay={i} />
			{/each}
		</div>
	</section>
{:else}
	<div class="pb-14"></div>
{/if}
