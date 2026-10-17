<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { FALLBACK_VECTOR } from '$lib/constants';
	import { fileUrl, srcSet } from '$lib/api/files';
	import { toman, faDigits, installment } from '$lib/format/money';
	import { api, ApiError } from '$lib/api/client';
	import type { InstallmentPlan, Paginated, Product, Shipment } from '$lib/api/types';
	import { auth } from '$lib/stores/auth.svelte';
	import { cart } from '$lib/stores/cart.svelte';
	import { recent } from '$lib/stores/recent.svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import ArViewer from '$lib/components/ArViewer.svelte';
	import FormCard from '$lib/components/FormCard.svelte';
	import SmartImage from '$lib/components/SmartImage.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { breadcrumbJsonLd, stripHtml } from '$lib/seo/seo';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { toast } from 'svelte-sonner';
	import DOMPurify from 'dompurify';
	import { CreditCard, Share2, Check, Store, ShieldCheck, RotateCcw, Truck, Star, Bell, HelpCircle, PenLine, Sparkles, BadgeCheck, Zap, Lock } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	interface Comment {
		id: number;
		user_name: string;
		rating: number;
		body: string;
		verified: boolean;
		created_at: string | null;
	}

	interface RatingSummary {
		count: number;
		avg: number | null;
		dist: Record<string, number>;
	}

	interface Question {
		id: number;
		user_name: string;
		question: string;
		answer: string | null;
		is_answered: boolean;
		created_at: string | null;
	}

	let { data }: { data: PageData } = $props();
	const p = $derived(data.product);

	let plans = $state<InstallmentPlan[]>([]);
	let shipments = $state<Shipment[]>([]);
	let related = $state<Product[]>([]);
	let comments = $state<Comment[]>([]);
	let summary = $state<RatingSummary | null>(null);
	let questions = $state<Question[]>([]);
	let questionText = $state('');
	let qSending = $state(false);
	let rating = $state(5);
	let body = $state('');
	let sending = $state(false);
	let alerting = $state(false);
	let alerted = $state(false);

	onMount(async () => {
		recent.push(p.id);
		const catId = p.categories?.[0]?.id;
		const [pl, sh, rel] = await Promise.all([
			api<InstallmentPlan[]>('/installments').catch(() => [] as InstallmentPlan[]),
			api<Shipment[]>('/shipments').catch(() => [] as Shipment[]),
			catId
				? api<Paginated<Product>>(`/products?category_id=${catId}`).then((r) => r.data.filter((x) => x.id !== p.id).slice(0, 4)).catch(() => [] as Product[])
				: Promise.resolve([] as Product[])
		]);
		plans = pl;
		shipments = sh;
		related = rel;
		try {
			const r = await api<{ data: Comment[]; summary?: RatingSummary }>(`/products/${p.slug}/comments`);
			comments = r.data;
			summary = r.summary ?? null;
		} catch {
			comments = [];
		}
		try {
			const q = await api<{ data: Question[] }>(`/products/${p.slug}/questions`);
			questions = q.data;
		} catch {
			questions = [];
		}
	});
	const bestPlan = $derived(plans[0] ?? null);
	const planMath = $derived(
		bestPlan ? installment(price, bestPlan.down_payment_percent, bestPlan.months, bestPlan.fee_percent) : null
	);
	const avgRating = $derived(summary?.avg ?? null);
	const faAvg = $derived(
		avgRating !== null
			? avgRating.toFixed(1).replace(/[0-9]/g, (d) => String.fromCharCode(d.charCodeAt(0) + 1728))
			: null
	);
	const shipLabel = $derived(
		shipments.find((s) => s.is_default)?.title ?? shipments[0]?.title ?? null
	);

	function share() {
		const url = window.location.href;
		if (navigator.share) {
			navigator.share({ title: p.name, url }).catch(() => {});
		} else {
			navigator.clipboard.writeText(url).then(
				() => toast.success('لینک کپی شد 🔗'),
				() => toast.error('کپی نشد!')
			);
		}
	}

	async function requestAlert() {
		if (!auth.loggedIn) {
			toast.error('برای اعلان موجودی وارد شو');
			window.location.href = `/login?next=/products/${p.slug}`;
			return;
		}
		alerting = true;
		try {
			await api('/stock-alerts', { method: 'POST', body: JSON.stringify({ product_id: p.id }) });
			alerted = true;
			toast.success('خبرت می‌کنیم به محض موجود شدن ✓');
		} catch (err) {
			toast.error(err instanceof ApiError ? err.message : 'ناموفق بود');
		} finally {
			alerting = false;
		}
	}

	async function askQuestion(e: SubmitEvent) {
		e.preventDefault();
		if (questionText.trim().length < 5) {
			toast.error('سوال کوتاهه');
			return;
		}
		if (!auth.loggedIn) {
			toast.error('برای پرسش وارد شو');
			window.location.href = `/login?next=/products/${p.slug}`;
			return;
		}
		qSending = true;
		try {
			const res = await api<{ message: string }>(`/products/${p.slug}/questions`, { method: 'POST', body: JSON.stringify({ question: questionText.trim() }) });
			questionText = '';
			toast.success(res.message);
		} catch (err) {
			toast.error(err instanceof ApiError ? err.message : 'ارسال ناموفق');
		} finally {
			qSending = false;
		}
	}

	async function sendComment(e: SubmitEvent) {
		e.preventDefault();
		if (body.trim().length < 3) {
			toast.error('متن نظر کوتاهه!');
			return;
		}
		sending = true;
		try {
			const res = await api<{ message: string }>(`/products/${p.slug}/comments`, {
				method: 'POST',
				body: JSON.stringify({ rating, body: body.trim() })
			});
			body = '';
			rating = 5;
			toast.success(res.message);
		} catch (err) {
			toast.error(err instanceof ApiError ? err.message : 'ثبت نظر ناموفق بود.');
		} finally {
			sending = false;
		}
	}

	let variantId = $state<number | null>(null);
	let qty = $state(1);
	let added = $state(false);

	const variant = $derived(p.variants.find((v) => v.id === variantId) ?? null);
	const price = $derived(variant && variant.price_rial > 0 ? variant.price_rial : p.final_price_rial);
	const stock = $derived(variant ? variant.quantity : p.quantity);
	const available = $derived(p.in_stock && stock > 0);
	const gallery = $derived(
		[p.image, ...(p.variants.map((v) => v.image) ?? [])].map((s) => fileUrl(s) ?? s).filter(Boolean) as string[]
	);
	const origin = $derived(page.url.origin);
	const mainImage = $derived(fileUrl(p.image) ?? `${origin}/images/hero-product.webp`);
	// DOMPurify is browser-only (same as about page): SSR renders raw admin HTML,
	// client hydrates with the sanitized version.
	const safeDescription = $derived(
		browser
			? DOMPurify.sanitize(p.description ?? '', {
					ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h2', 'h3', 'span', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td']
				})
			: (p.description ?? '')
	);
	// وزن و ابعاد از فیلدهای ساختاری محصول — ته جدول مشخصات نمایش داده می‌شوند
	const extraSpecs = $derived.by(() => {
		const out: { attr: string; value: string }[] = [];
		if (p.weight_gram) out.push({ attr: 'وزن', value: `${faDigits(p.weight_gram)} گرم` });
		const d = p.dimensions_cm;
		const parts = d ? [d.length, d.width, d.height].filter((n) => n !== null && n !== undefined) : [];
		if (parts.length > 0) out.push({ attr: 'ابعاد', value: `${parts.map((n) => faDigits(n as number)).join(' × ')} سانتی‌متر` });
		return out;
	});
	const hasSpecs = $derived(p.specs.length > 0 || extraSpecs.length > 0);
	const headJsonLd = $derived.by(() => {
		const trail = [
			{ name: 'خانه', path: '/' },
			{ name: 'کالاها', path: '/products' },
			...(p.categories?.[0] ? [{ name: p.categories[0].title, path: `/products?category_id=${p.categories[0].id}` }] : []),
			{ name: p.name, path: `/products/${p.slug}` }
		];
		const product: Record<string, unknown> = {
			'@context': 'https://schema.org',
			'@type': 'Product',
			name: p.name,
			image: [mainImage],
			description: stripHtml(p.description),
			sku: p.product_code ?? String(p.id),
			brand: p.brand ? { '@type': 'Brand', name: p.brand.name } : undefined,
			offers: {
				'@type': 'Offer',
				url: `${origin}/products/${p.slug}`,
				priceCurrency: 'IRT',
				price: Math.round(price / 10),
				availability: available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
				itemCondition: 'https://schema.org/NewCondition'
			}
		};
		if (summary && summary.count > 0 && summary.avg !== null) {
			product.aggregateRating = {
				'@type': 'AggregateRating',
				ratingValue: summary.avg,
				reviewCount: summary.count
			};
		}
		const out: Record<string, unknown>[] = [product, breadcrumbJsonLd(origin, trail)];
		const answered = questions.filter((q) => q.is_answered && q.answer);
		if (answered.length > 0) {
			out.push({
				'@context': 'https://schema.org',
				'@type': 'FAQPage',
				mainEntity: answered.slice(0, 10).map((q) => ({
					'@type': 'Question',
					name: q.question,
					acceptedAnswer: { '@type': 'Answer', text: q.answer }
				}))
			});
		}
		return out;
	});
	let activeImg = $state<string | null>(null);

	// ذره‌بین گالری: روی دسکتاپ با حرکت موس روی عکس، همان نقطه تا ۲ برابر زوم می‌شود
	let canZoom = $state(false);
	let zooming = $state(false);
	let zoomX = $state(50);
	let zoomY = $state(50);

	onMount(() => {
		canZoom = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
	});

	function handleZoom(e: MouseEvent) {
		if (!canZoom) return;
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		zoomX = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
		zoomY = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
		zooming = true;
	}

	function addToCart() {
		cart.add(
			{
				productId: p.id,
				variantId,
				name: p.name,
				color: variant?.color?.name ?? null,
				price,
				wasPrice: !variant && p.discount_rial > 0 ? p.price_rial : null,
				image: (fileUrl(variant?.image ?? p.image) ?? p.image) as string | null
			},
			qty
		);
		added = true;
		toast.success('به سبد اضافه شد 🛒', { description: p.name });
		setTimeout(() => (added = false), 2000);
	}

	function buyNow() {
		cart.add(
			{
				productId: p.id,
				variantId,
				name: p.name,
				color: variant?.color?.name ?? null,
				price,
				wasPrice: !variant && p.discount_rial > 0 ? p.price_rial : null,
				image: (fileUrl(variant?.image ?? p.image) ?? p.image) as string | null
			},
			qty
		);
		window.location.href = '/checkout';
	}

	const discountPct = $derived(
		p.price_rial > 0 && p.discount_rial > 0 ? Math.round((p.discount_rial / p.price_rial) * 100) : 0
	);

	// "چرا این کالا؟" — سه ویژگی اول مشخصات، با آیکون
	const whyFeatures = $derived.by(() => {
		const icons = [Sparkles, BadgeCheck, Zap];
		if (p.specs.length > 0) {
			return p.specs.slice(0, 3).map((s, i) => ({
				icon: icons[i % icons.length],
				title: s.attr ?? 'ویژگی',
				desc: s.value
			}));
		}
		return [
			{ icon: BadgeCheck, title: 'ضمانت اصالت', desc: 'کالای اورجینال با فاکتور رسمی' },
			{ icon: Truck, title: 'ارسال سریع', desc: 'تحویل به سراسر کشور با بسته‌بندی مطمئن' },
			{ icon: ShieldCheck, title: p.warranty ? `گارانتی ${p.warranty.title}` : 'گارانتی معتبر', desc: 'خدمات پس از فروش واقعی' }
		];
	});
</script>

<SeoHead
	title={p.name}
	description="{p.name} با گارانتی {p.warranty?.title ?? 'معتبر'} — {toman(price)}"
	image={p.image}
	type="product"
	jsonLd={headJsonLd}
/>

<section class="mx-auto max-w-7xl px-4 py-8">
	<nav class="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400" aria-label="breadcrumb">
		<a href="/" class="transition-colors hover:text-[#2635D9] dark:hover:text-[#8B93FF]">خانه</a>
		<span>/</span>
		<a href="/products" class="transition-colors hover:text-[#2635D9] dark:hover:text-[#8B93FF]">کالاها</a>
		{#if p.categories?.[0]}
			<span>/</span>
			<a href="/products?category_id={p.categories[0].id}" class="transition-colors hover:text-[#2635D9] dark:hover:text-[#8B93FF]">{p.categories[0].title}</a>
		{/if}
		<span>/</span>
		<span class="max-w-56 truncate font-bold text-[#1B2452] dark:text-slate-200">{p.name}</span>
	</nav>
	<div class="grid gap-6 lg:grid-cols-2 lg:gap-10">
		<!-- gallery -->
		<div class="lg:sticky lg:top-24 lg:self-start">
			<Dialog.Root>
				<Dialog.Trigger class="block w-full cursor-zoom-in">
					<div class="relative flex aspect-square items-center justify-center overflow-hidden rounded-[24px] border border-[#E2E6F3] bg-[#F7F8FC] p-8 shadow-[0_16px_44px_rgba(27,36,82,0.08)] md:p-12 dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none"
					role="img"
					aria-label={p.name}
					onmouseenter={() => canZoom && (zooming = true)}
					onmouseleave={() => (zooming = false)}
					onmousemove={handleZoom}
				>
						{#if p.discount_rial > 0}
							<Badge class="badge-electric absolute top-4 right-4 z-10 border-0 px-3 py-1 text-xs font-black">
								<span class="tick">٪{discountPct.toLocaleString('fa-IR')} تخفیف</span>
							</Badge>
						{/if}
						{#if fileUrl(activeImg ?? p.image)}
							<div
								class="flex h-full w-full items-center justify-center will-change-transform"
								style="transform: {zooming ? 'scale(2)' : 'scale(1)'}; transform-origin: {zoomX}% {zoomY}%; transition: transform 120ms ease-out;"
							>
							<SmartImage
								src={activeImg ?? p.image}
								variants={activeImg ? null : (p.image_variants ?? null)}
								alt={p.name}
								eager
								widths={[320, 640, 960]}
								sizes="(max-width: 768px) 100vw, 50vw"
								width={800}
								height={800}
								imgClass="max-h-full object-contain drop-shadow-[0_20px_36px_rgba(27,36,82,0.18)]"
							/>
							</div>
						{:else}
							<img src={FALLBACK_VECTOR} alt="" width="160" height="160" class="w-40 text-[#3B46F2]/60" />
						{/if}
					</div>
				</Dialog.Trigger>
				<Dialog.Content class="max-w-3xl border-[#E2E6F3] bg-white p-2 dark:border-white/15 dark:bg-panel">
					<Dialog.Title class="sr-only">{p.name}</Dialog.Title>
					<img src={fileUrl(activeImg ?? p.image) ?? FALLBACK_VECTOR} srcset={srcSet(activeImg ?? p.image, [640, 960]) ?? undefined} sizes="(max-width: 768px) 100vw, 800px" alt={p.name} width="800" height="800" loading="lazy" decoding="async" class="max-h-[80vh] w-full object-contain" />
				</Dialog.Content>
			</Dialog.Root>
			{#if gallery.length > 1}
				<div class="mt-3 grid grid-cols-4 gap-2.5">
					{#each gallery.slice(0, 4) as g}
						<button
							onclick={() => (activeImg = g)}
							class="aspect-square overflow-hidden rounded-2xl border-2 bg-[#F7F8FC] transition-all dark:bg-white/[0.04] {activeImg === g || (!activeImg && g === gallery[0])
								? 'border-[#3B46F2] shadow-[0_8px_20px_rgba(59,70,242,0.25)]'
								: 'border-[#E2E6F3] hover:border-[#3B46F2]/50 dark:border-white/10'}"
						>
							<img src={g} alt="" width="160" height="160" loading="lazy" decoding="async" class="h-full w-full object-cover" />
						</button>
					{/each}
				</div>
			{/if}
			{#if p.ar_model_url}
				<div class="mt-4">
					<ArViewer glb={p.ar_model_url} usdz={p.ar_ios_url} poster={fileUrl(p.image) ?? undefined} alt={p.name} />
				</div>
			{/if}
		</div>

		<!-- buy panel -->
		<div>
			<Card.Root class="card-brand overflow-hidden py-0">
				<div class="h-1.5 bg-gradient-to-l from-[#3B46F2] via-[#2635D9] to-[#3B46F2]"></div>
				<Card.Content class="flex flex-col gap-4 p-5 md:p-7">
					<div>
						<div class="flex items-start justify-between gap-3">
							<div class="text-xs font-bold text-slate-500 dark:text-slate-400">{p.brand?.name ?? 'آرزو'} {p.model ? `• مدل ${p.model}` : ''}</div>
							<button
								type="button"
								onclick={share}
								aria-label="اشتراک‌گذاری"
								class="flex shrink-0 items-center gap-1.5 rounded-full border border-[#E2E6F3] px-3 py-1.5 text-xs font-bold text-slate-500 transition-colors hover:border-[#3B46F2] hover:text-[#2635D9] dark:border-white/15 dark:text-slate-300 dark:hover:text-[#8B93FF]"
							>
								<Share2 class="size-3.5" /> اشتراک
							</button>
						</div>
						<h1 class="display mt-1 text-2xl leading-9 text-[#1B2452] md:text-[28px] dark:text-white">{p.name}</h1>
						<div class="mt-2 flex flex-wrap items-center gap-2 text-xs">
							{#if avgRating !== null}
								<span class="flex items-center gap-0.5" dir="ltr">
									{#each [1, 2, 3, 4, 5] as s}
										<Star class="size-4 {s <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}" />
									{/each}
								</span>
								<span class="tick text-sm font-black text-[#1B2452] dark:text-white">{faAvg}</span>
								<a href="#reviews" class="font-bold text-slate-500 transition-colors hover:text-[#2635D9] dark:hover:text-[#8B93FF]">({faDigits(comments.length)} نظر)</a>
							{:else}
								<span class="text-slate-400 dark:text-slate-500">هنوز نظری ثبت نشده</span>
							{/if}
							<span class="text-slate-300 dark:text-slate-600">•</span>
							<span class="text-slate-500">کد کالا: <span class="tick font-bold">{p.product_code ?? '—'}</span></span>
						</div>
					</div>

					<Separator />

					{#if p.specs.length > 0}
						<ul class="flex flex-col gap-2">
							{#each p.specs.slice(0, 4) as s}
								<li class="flex items-center gap-2 text-[13px] text-slate-600 dark:text-slate-300">
									<span class="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#3B46F2]/10">
										<Check class="size-3 text-[#2635D9] dark:text-[#8B93FF]" />
									</span>
									<span class="font-black text-[#1B2452] dark:text-white">{s.attr ?? 'مشخصات'}:</span> {s.value}
								</li>
							{/each}
						</ul>
					{/if}

					{#if p.warranty}
						<div>
							<Badge variant="outline" class="gap-1.5 border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-black text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600 dark:text-emerald-400">
								<ShieldCheck class="size-3.5" /> {p.warranty.title}
							</Badge>
						</div>
					{/if}

					<div class="rounded-2xl bg-[#F7F8FC] p-4 dark:bg-white/[0.04]">
						{#if p.discount_rial > 0}
							<div class="flex items-center gap-2">
								<span class="tick text-sm text-slate-400 line-through">{toman(p.price_rial)}</span>
								<Badge class="badge-electric border-0 text-[11px] font-black">٪{discountPct.toLocaleString('fa-IR')} تخفیف</Badge>
							</div>
						{/if}
						<div class="font-toman price-navy mt-1 text-[32px] leading-10 font-black">{toman(price)}</div>

						{#if p.variants.length > 0}
							<div class="mt-3">
								<div class="mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">رنگ:</div>
								<div class="flex flex-wrap gap-2">
									{#each p.variants as v}
										<button
											onclick={() => (variantId = variantId === v.id ? null : v.id)}
											class="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition-all {variantId === v.id
												? 'border-[#3B46F2] bg-[#3B46F2] text-white shadow-[0_8px_20px_rgba(59,70,242,0.4)]'
												: 'border-[#E2E6F3] text-slate-600 hover:border-[#3B46F2]/60 dark:border-white/15 dark:text-slate-300'}"
										>
											{#if v.color?.hex}
												<span
													class="inline-block h-4 w-4 rounded-full border border-white/30"
													style="background:{v.color.hex}"
												></span>
											{/if}
											{v.color?.name ?? 'ساده'}
										</button>
									{/each}
								</div>
							</div>
						{/if}

						{#if available}
							<div class="mt-4 flex items-center gap-3">
								<div class="flex shrink-0 items-center rounded-full border border-[#E2E6F3] bg-white dark:border-white/15 dark:bg-white/5">
									<button
										onclick={() => (qty = Math.max(1, qty - 1))}
										disabled={qty <= 1}
										class="px-4 py-2 text-lg disabled:cursor-not-allowed disabled:opacity-30"
										aria-label="کمتر"
									>
										−
									</button>
									<span class="tick min-w-8 text-center font-black text-[#1B2452] dark:text-white">{faDigits(qty)}</span>
									<button
										onclick={() => (qty = Math.min(stock, qty + 1))}
										disabled={qty >= stock}
										class="px-4 py-2 text-lg disabled:cursor-not-allowed disabled:opacity-30"
										aria-label="بیشتر"
									>
										+
									</button>
								</div>
								<Button onclick={addToCart} size="lg" class="btn-electric flex-1 rounded-2xl border-0 font-black">
									{added ? '✓ به سبد اضافه شد' : 'افزودن به سبد'}
								</Button>
							</div>
							<Button onclick={buyNow} size="lg" variant="secondary" class="mt-2.5 w-full rounded-2xl bg-[#1B2452] font-black text-white hover:bg-[#111111] hover:text-white dark:bg-white dark:text-[#1B2452] dark:hover:bg-white/90">
								خرید فوری
							</Button>
							<div class="mt-2.5 text-center text-xs font-bold text-slate-500">ارسال رایگان برای این کالا 🚚</div>
							<div class="tick mt-1 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400">{faDigits(stock)} عدد موجود در انبار</div>
						{:else}
							<Button
								onclick={requestAlert}
								disabled={alerting || alerted}
								size="lg"
								variant="outline"
								class="mt-4 w-full rounded-2xl border-amber-300 bg-amber-50 font-extrabold text-amber-700 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
							>
								<Bell class="size-4" /> {alerted ? 'خبرت می‌کنیم ✓' : alerting ? '...' : 'موجود شد خبرم کن'}
							</Button>
							<div class="mt-2 text-center text-xs font-bold text-red-500">ناموجود — به محض شارژ خبرت می‌کنیم</div>
						{/if}
					</div>

					{#if bestPlan && planMath && available}
						<div class="flex items-start gap-3 rounded-2xl border border-[#3B46F2]/25 bg-[#3B46F2]/[0.06] p-4 dark:bg-[#3B46F2]/10">
							<CreditCard class="mt-0.5 size-5 shrink-0 text-[#2635D9] dark:text-[#8B93FF]" />
							<div class="text-xs leading-6 text-slate-600 dark:text-slate-300">
								<span class="font-extrabold text-[#1B2452] dark:text-white">خرید قسطی {bestPlan.title}:</span>
								پیش‌پرداخت <span class="font-toman font-bold">{toman(planMath.down)}</span>
								+ ماهانه حدود <span class="font-toman font-bold">{toman(planMath.monthly)}</span>
								<span class="tick">× {faDigits(bestPlan.months)} ماه</span>
								{#if plans.length > 1}
									<span class="text-slate-400 dark:text-slate-500"> — {faDigits(plans.length - 1)} طرح دیگه هم موقع تسویه هست</span>
								{/if}
							</div>
						</div>
					{/if}

					<div class="grid grid-cols-2 gap-2.5">
						{#each [{ icon: Lock, t: 'پرداخت امن' }, { icon: Truck, t: shipLabel ? `ارسال با ${shipLabel}` : 'ارسال سریع' }, { icon: RotateCcw, t: '۷ روز مرجوعی' }, { icon: Store, t: 'فروشنده: آرزو' }] as f}
							{@const Icon = f.icon}
							<div class="flex items-center gap-2 rounded-2xl border border-[#E2E6F3] bg-white px-3 py-2.5 text-xs font-bold text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
								<Icon class="size-4 shrink-0 text-[#3B46F2] dark:text-[#8B93FF]" />
								{f.t}
							</div>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>

	<!-- WHY this product -->
	<Reveal class="mt-12">
		<h2 class="display section-title-accent text-center text-xl text-[#1B2452] md:text-2xl dark:text-white">چرا {p.brand?.name ?? 'این کالا'}؟</h2>
		<div class="mt-5 grid gap-3 sm:grid-cols-3">
			{#each whyFeatures as f}
				{@const Icon = f.icon}
				<Card.Root class="card-brand py-0">
					<Card.Content class="flex flex-col items-center gap-2 p-5 text-center">
						<span class="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B46F2] to-[#2635D9] text-white shadow-[0_10px_24px_rgba(59,70,242,0.4)]">
							<Icon class="size-5" />
						</span>
						<span class="text-sm font-black text-[#1B2452] dark:text-white">{f.title}</span>
						<span class="text-xs leading-6 text-slate-500 dark:text-slate-400">{f.desc}</span>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	</Reveal>

	{#if hasSpecs}
		<Reveal class="mt-12">
			<h2 class="display section-title-accent text-xl text-[#1B2452] md:text-2xl dark:text-white">مشخصات فنی</h2>
			<Card.Root class="card-brand mt-4 overflow-hidden py-0">
				<Card.Content class="p-0">
					<dl>
						{#each p.specs as s, i}
							<div class="flex items-start justify-between gap-4 px-4 py-3 text-sm md:px-5 {i % 2 === 0 ? 'bg-[#F7F8FC] dark:bg-white/[0.04]' : ''}">
								<dt class="shrink-0 font-black text-[#1B2452] dark:text-white">{s.attr ?? 'مشخصات'}</dt>
								<dd class="text-left leading-6 text-slate-600 dark:text-slate-300">{s.value}</dd>
							</div>
						{/each}
						{#each extraSpecs as s, i}
							<div class="tick flex items-start justify-between gap-4 px-4 py-3 text-sm md:px-5 {(p.specs.length + i) % 2 === 0 ? 'bg-[#F7F8FC] dark:bg-white/[0.04]' : ''}">
								<dt class="shrink-0 font-black text-[#1B2452] dark:text-white">{s.attr}</dt>
								<dd class="text-left leading-6 text-slate-600 dark:text-slate-300">{s.value}</dd>
							</div>
						{/each}
					</dl>
				</Card.Content>
			</Card.Root>
		</Reveal>
	{/if}

	<Reveal class="mt-12">
		<div class="flex items-center justify-between">
			<h2 id="reviews" class="display section-title-accent scroll-mt-24 text-xl text-[#1B2452] md:text-2xl dark:text-white">نظر مشتریان</h2>
			{#if avgRating !== null}
				<span class="tick text-sm font-bold text-slate-500 dark:text-slate-300" dir="rtl">
					<bdi>{faAvg}</bdi> از <bdi>۵</bdi> (<bdi>{faDigits(summary?.count ?? comments.length)}</bdi> نظر)
				</span>
			{/if}
		</div>
		{#if summary && summary.count > 0}
			<Card.Root class="card-brand mt-4 py-0">
				<Card.Content class="flex items-center gap-5 p-4 md:p-5">
					<div class="shrink-0 text-center">
						<span class="tick text-4xl font-black text-[#1B2452] dark:text-white">{faAvg}</span>
						<span class="mt-1 flex justify-center gap-0.5" dir="ltr">
							{#each [1, 2, 3, 4, 5] as s}
								<Star class="size-3.5 {s <= Math.round(avgRating ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}" />
							{/each}
						</span>
						<span class="mt-1 block text-[11px] font-bold text-slate-500 dark:text-slate-400">{faDigits(summary.count)} نظر</span>
					</div>
					<Separator orientation="vertical" class="h-20" />
					<div class="flex flex-1 flex-col gap-1.5">
						{#each [5, 4, 3, 2, 1] as star}
							{@const count = summary.dist[String(star)] ?? 0}
							{@const pct = summary.count > 0 ? Math.round((count / summary.count) * 100) : 0}
							<div class="flex items-center gap-2 text-[11px]">
								<span class="tick w-3 text-slate-500 dark:text-slate-400">{faDigits(star)}</span>
								<Star class="size-3 shrink-0 fill-amber-400 text-amber-400" />
								<span class="h-2 flex-1 overflow-hidden rounded-full bg-[#E2E6F3] dark:bg-white/10">
									<span class="block h-full rounded-full bg-gradient-to-l from-[#3B46F2] to-[#2635D9] transition-all" style="width:{pct}%"></span>
								</span>
								<span class="tick w-7 text-right text-slate-500 dark:text-slate-400">{faDigits(pct)}٪</span>
							</div>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		{/if}
		<div class="mt-4 grid items-start gap-4 lg:grid-cols-[1fr_340px]">
			<div>
				{#if comments.length === 0}
					<Card.Root class="card-brand py-0">
						<Card.Content class="p-6 text-center text-sm font-bold text-slate-500">
							اولین نفری باش که نظر میده ✍️
						</Card.Content>
					</Card.Root>
				{:else}
					<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
						{#each comments as c (c.id)}
							<Card.Root class="card-brand py-0">
								<Card.Content class="flex h-full flex-col gap-2 p-4">
									<div class="flex items-center gap-2.5">
										<span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3B46F2] to-[#2635D9] text-sm font-black text-white">
											{(c.user_name ?? 'ک').trim().charAt(0) || 'ک'}
										</span>
										<span class="min-w-0">
											<span class="block truncate text-[13px] font-extrabold text-[#1B2452] dark:text-white">
												{c.user_name}
											</span>
											<span class="mt-0.5 flex items-center gap-0.5" dir="ltr">
												{#each [1, 2, 3, 4, 5] as s}
													<Star class="size-3 {s <= c.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}" />
												{/each}
											</span>
										</span>
										{#if c.verified}
											<Badge variant="outline" class="mr-auto flex shrink-0 items-center gap-0.5 border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600 dark:text-emerald-400">
												<Check class="size-3" /> خریدار
											</Badge>
										{/if}
									</div>
									<p class="line-clamp-4 text-[13px] leading-6 text-slate-600 dark:text-slate-300">{c.body}</p>
								</Card.Content>
							</Card.Root>
						{/each}
					</div>
				{/if}
			</div>
			<div class="md:sticky md:top-24">
				{#if auth.loggedIn}
					<FormCard title="ثبت نظر" icon={PenLine}>
						<form onsubmit={sendComment} class="flex flex-col gap-2" dir="rtl">
							<div class="flex items-center gap-1" dir="ltr">
								{#each [1, 2, 3, 4, 5] as s}
									<button type="button" onclick={() => (rating = s)} aria-label="{s} ستاره">
										<Star class="size-6 transition-transform hover:scale-110 {s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}" />
									</button>
								{/each}
								<span class="ms-2 text-xs text-slate-500 dark:text-slate-400" dir="rtl"><bdi>{faDigits(rating)}</bdi> از <bdi>۵</bdi></span>
							</div>
							<textarea
								bind:value={body}
								rows={3}
								maxlength={2000}
								placeholder="تجربه‌ت با این کالا رو بنویس…"
								class="w-full rounded-xl border border-[#E2E6F3] bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-[#3B46F2] dark:border-white/15"
							></textarea>
							<Button type="submit" disabled={sending} size="sm" class="btn-electric w-full rounded-full border-0 font-bold">
								{sending ? '...' : 'ثبت نظر'}
							</Button>
						</form>
					</FormCard>
				{:else}
					<a href="/login?next=/products/{p.slug}" class="block rounded-2xl border border-dashed border-[#3B46F2]/50 p-4 text-center text-sm font-bold text-[#2635D9] dark:text-[#8B93FF]">
						برای ثبت نظر وارد شو →
					</a>
				{/if}
			</div>
		</div>
	</Reveal>

	<Reveal class="mt-12">
		<div class="flex items-center justify-between">
			<h2 class="display section-title-accent flex items-center gap-2 text-xl text-[#1B2452] md:text-2xl dark:text-white">سوالات پرتکرار</h2>
			<Badge variant="secondary" class="tick bg-[#F7F8FC] font-black text-[#2635D9] hover:bg-[#F7F8FC] hover:text-[#2635D9] dark:bg-white/10 dark:text-[#8B93FF]">{faDigits(questions.length)} پرسش</Badge>
		</div>
		{#if questions.length === 0}
			<Card.Root class="card-brand mt-4 py-0">
				<Card.Content class="p-6 text-center text-sm font-bold text-slate-500">هنوز پرسشی ثبت نشده — اولین باش 🙋</Card.Content>
			</Card.Root>
		{:else}
			<Accordion.Root type="single" class="card-brand mt-4 overflow-hidden px-4 py-0">
				{#each questions.slice(0, 8) as q, i (q.id)}
					<Accordion.Item value="q-{i}" class="border-[#E2E6F3] px-1 dark:border-white/10">
						<Accordion.Trigger class="py-3.5 text-right text-sm font-extrabold text-[#1B2452] hover:text-[#2635D9] hover:no-underline dark:text-white dark:hover:text-[#8B93FF]">
							{q.question}
						</Accordion.Trigger>
						<Accordion.Content class="pb-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
							{#if q.is_answered && q.answer}
								{q.answer}
								<span class="mt-1 block text-[11px] font-bold text-slate-400">پاسخ پشتیبانی آرزو • {q.user_name}</span>
							{:else}
								<span class="text-xs font-bold text-slate-400">در انتظار پاسخ پشتیبانی…</span>
							{/if}
						</Accordion.Content>
					</Accordion.Item>
				{/each}
			</Accordion.Root>
		{/if}
		<FormCard title="سوال داری؟ بپرس" subtitle="درباره این کالا هر سوالی داری بنویس" icon={HelpCircle} cls="mt-3">
			<form onsubmit={askQuestion} class="flex gap-2" dir="rtl">
				<input bind:value={questionText} maxlength={1000} placeholder="سوال خود را بپرس..." class="flex-1 rounded-xl border border-[#E2E6F3] bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-[#3B46F2] dark:border-white/15" />
				<Button type="submit" disabled={qSending} size="sm" class="btn-electric shrink-0 rounded-full border-0 font-bold">{qSending ? '...' : 'ارسال'}</Button>
			</form>
		</FormCard>
	</Reveal>

	{#if p.description}
		<Reveal class="mt-12">
			<h2 class="display section-title-accent text-xl text-[#1B2452] md:text-2xl dark:text-white">توضیحات محصول</h2>
			<Card.Root class="card-brand mt-4 py-0">
				<Card.Content class="p-5 md:p-6">
					<div class="prose-fa text-sm leading-7 text-slate-600 dark:text-slate-300">
						{@html safeDescription}
					</div>
				</Card.Content>
			</Card.Root>
		</Reveal>
	{/if}

	{#if related.length > 0}
		<div class="mt-12">
			<div class="flex items-end justify-between">
				<h2 class="display section-title-accent text-xl text-[#1B2452] md:text-2xl dark:text-white">کالاهای مرتبط</h2>
				{#if p.categories?.[0]}
					<Button href="/products?category_id={p.categories[0].id}" variant="outline" size="sm" class="rounded-full border-[#3B46F2]/25 bg-[#3B46F2]/8 font-black text-[#2635D9] hover:bg-[#3B46F2] hover:text-white dark:text-[#8B93FF]">همه ←</Button>
				{/if}
			</div>
			<div class="mt-4 grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 md:grid-cols-4">
				{#each related as r, i (r.id)}
					<ProductCard product={r} delay={i} />
				{/each}
			</div>
		</div>
	{/if}
</section>

<!-- sticky mobile bar -->
<div class="sticky bottom-0 z-40 border-t border-[#E2E6F3] bg-white/90 p-3 backdrop-blur-md dark:border-white/10 dark:bg-ink/90">
	<div class="flex items-center gap-3">
		<div class="min-w-0 flex-1">
			<div class="truncate text-[11px] text-slate-500 dark:text-slate-400">{p.name}</div>
			<div class="font-toman price-navy font-extrabold">{toman(price)}</div>
		</div>
		{#if available}
			<Button onclick={addToCart} class="btn-electric shrink-0 rounded-full border-0 px-6 py-2.5 text-sm font-extrabold">
				افزودن
			</Button>
		{:else}
			<Button
				onclick={requestAlert}
				disabled={alerting || alerted}
				variant="outline"
				class="rounded-full border-amber-300 bg-amber-50 px-6 py-2.5 text-sm font-extrabold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
			>
				{alerted ? '✓' : 'خبرم کن'}
			</Button>
		{/if}
	</div>
</div>
