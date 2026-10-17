<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { CAT_VECTORS, FALLBACK_VECTOR } from '$lib/constants';
	import { fileUrl } from '$lib/api/files';
	import { toman } from '$lib/format/money';
	import SmartImage from './SmartImage.svelte';
	import { cart } from '$lib/stores/cart.svelte';
	import { wishlist } from '$lib/stores/wishlist.svelte';
	import type { Product } from '$lib/api/types';
	import Reveal from './Reveal.svelte';
	import { toast } from 'svelte-sonner';
	import { ShieldCheck, ShoppingCart, Heart, Scale } from 'lucide-svelte';
	import { compare } from '$lib/stores/compare.svelte';

	let { product, delay = 0 }: { product: Product; delay?: number } = $props();

	const available = $derived(product.in_stock && product.quantity > 0);
	const hasDiscount = $derived(product.discount_rial > 0);
	const discountPct = $derived(
		product.price_rial > 0 ? Math.round((product.discount_rial / product.price_rial) * 100) : 0
	);
	const vector = $derived(CAT_VECTORS[product.categories?.[0]?.slug] ?? FALLBACK_VECTOR);

	function quickAdd(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (!available) return;
		cart.add({
			productId: product.id,
			variantId: null,
			name: product.name,
			color: null,
			price: product.final_price_rial,
			wasPrice: hasDiscount ? product.price_rial : null,
			image: fileUrl(product.image) ?? product.image
		});
		toast.success('به سبد اضافه شد 🛒', { description: product.name });
	}

	async function toggleWish(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		const added = await wishlist.toggle(product.id);
		if (added) toast.success('به علاقه‌مندی‌ها اضافه شد ❤️');
	}

	function toggleCompare(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (compare.has(product.id)) {
			compare.toggle(product.id);
			toast.info('از مقایسه حذف شد');
			return;
		}
		if (compare.count >= 4) {
			toast.error('حداکثر ۴ کالا قابل مقایسه است');
			return;
		}
		compare.toggle(product.id);
		toast.success('به مقایسه اضافه شد ⚖️');
	}
</script>

<Reveal delay={(delay % 4) * 70} class="h-full">
	<Card.Root class="card-brand group relative flex h-full flex-col gap-0 overflow-hidden py-0">
		<!-- top accent line -->
		<div class="absolute inset-x-0 top-0 z-20 h-1 bg-gradient-to-l from-[#3B46F2] via-[#2635D9] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

		<!-- image: full-bleed, edge to edge, no inner padding -->
		<a
			href="/products/{product.slug}"
			class="relative block aspect-square w-full overflow-hidden bg-[#EDEFF7] dark:bg-white/[0.04]"
		>
			{#if hasDiscount}
				<div class="badge-electric absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black">
					<span class="tick">٪{discountPct.toLocaleString('fa-IR')} تخفیف</span>
				</div>
			{/if}
			<div class="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
				<button
					type="button"
					onclick={toggleWish}
					aria-label="علاقه‌مندی"
					class="flex size-8 items-center justify-center rounded-xl shadow-sm backdrop-blur-md transition-all hover:scale-110 active:scale-95 {wishlist.has(product.id)
						? 'bg-rose-500 text-white shadow-[0_6px_16px_rgba(244,63,94,0.45)]'
						: 'border border-[#E2E6F3] bg-white/95 text-[#1B2452] hover:text-rose-500 dark:border-white/15 dark:bg-white/10 dark:text-slate-200'}"
				>
					<Heart class="size-[16px] {wishlist.has(product.id) ? 'fill-white' : ''}" />
				</button>
				<button
					type="button"
					onclick={toggleCompare}
					aria-label="مقایسه"
					class="flex size-8 items-center justify-center rounded-xl shadow-sm backdrop-blur-md transition-all hover:scale-110 active:scale-95 {compare.has(product.id)
						? 'bg-[#1B2452] text-white dark:bg-[#3B46F2]'
						: 'border border-[#E2E6F3] bg-white/95 text-[#1B2452] hover:border-[#3B46F2] hover:text-[#3B46F2] dark:border-white/15 dark:bg-white/10 dark:text-slate-200'}"
				>
					<Scale class="size-[15px]" />
				</button>
			</div>

			{#if fileUrl(product.image)}
				<SmartImage
					src={product.image}
					variants={product.image_variants}
					alt={product.name}
					widths={[320, 640, 960]}
					sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
					width={600}
					height={600}
					imgClass="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05] {available ? '' : 'opacity-40 grayscale'}"
				/>
			{:else}
				<span class="absolute inset-0 flex items-center justify-center">
					<img
						src={vector}
						alt=""
						decoding="async"
						width="96"
						height="96"
						loading="lazy"
						class="w-20 text-[#3B46F2] transition-transform duration-700 group-hover:scale-110 sm:w-24"
					/>
				</span>
			{/if}

			{#if !available}
				<div class="absolute inset-0 z-[5] flex items-center justify-center bg-white/60 backdrop-blur-[2px] dark:bg-[#111111]/50">
					<Badge class="border-0 bg-[#111111] px-3 py-1 text-xs font-black text-white hover:bg-[#111111]">ناموجود</Badge>
				</div>
			{/if}

			{#if available}
				<div class="absolute inset-x-3 bottom-3 z-10 translate-y-14 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100">
					<Button
						size="sm"
						onclick={quickAdd}
						class="btn-electric w-full rounded-2xl border-0 py-5 text-[13px] font-black"
					>
						<ShoppingCart class="size-4" /> افزودن به سبد
					</Button>
				</div>
			{/if}
		</a>

		<!-- content -->
		<a href="/products/{product.slug}" class="flex flex-1 flex-col">
			<Card.Content class="flex flex-1 flex-col gap-2 p-3.5 sm:p-4">
				<div class="flex items-center justify-between gap-2">
					<Badge variant="secondary" class="max-w-[55%] truncate bg-[#F7F8FC] px-2.5 py-0.5 text-[11px] font-black text-[#2635D9] hover:bg-[#F7F8FC] hover:text-[#2635D9] dark:bg-white/10 dark:text-[#8B93FF]">
						{product.brand?.name ?? 'آرزو'}
					</Badge>
					<Badge variant="outline" class="flex shrink-0 items-center gap-1 px-2 py-0.5 text-[10px] font-bold {available ? 'border-[#3B46F2]/25 bg-[#3B46F2]/8 text-[#2635D9] dark:border-[#8B93FF]/30 dark:bg-[#3B46F2]/15 dark:text-[#B9BFFF]' : ''}">
						<span class="size-1.5 rounded-full {available ? 'bg-[#3B46F2] animate-pulse' : 'bg-stone-400'}"></span>
						{available ? 'موجود' : 'ناموجود'}
					</Badge>
				</div>

				<Card.Title
					class="line-clamp-2 min-h-9 text-[13.5px] font-extrabold leading-6 text-[#1B2452] transition-colors group-hover:text-[#2635D9] sm:min-h-10 sm:text-[14px] dark:text-white dark:group-hover:text-[#8B93FF]"
				>
					{product.name}
				</Card.Title>

				{#if product.warranty}
					<div class="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
						<ShieldCheck class="size-3.5 text-[#3B46F2]" /> {product.warranty.title}
					</div>
				{/if}

				<div class="mt-auto pt-2">
					<div class="h-px w-full bg-gradient-to-l from-[#3B46F2]/25 via-[#E2E6F3] to-transparent dark:via-white/10"></div>
					<div class="flex items-end justify-between gap-2 pt-2.5">
						<div class="min-w-0">
							{#if hasDiscount}
								<div class="flex items-center gap-1.5">
									<span class="tick text-[11px] text-slate-400 line-through">{toman(product.price_rial)}</span>
								</div>
							{/if}
							<div class="font-toman price-navy text-[17px] font-black leading-7 sm:text-[18px]">
								{toman(product.final_price_rial)}
							</div>
						</div>
						{#if hasDiscount}
							<Badge class="tick shrink-0 border-0 bg-[#1B2452] px-2 py-1 text-[10px] font-black text-white hover:bg-[#1B2452] dark:bg-[#3B46F2] dark:hover:bg-[#3B46F2]">
								{toman(product.discount_rial)} 🎁
							</Badge>
						{/if}
					</div>
				</div>
			</Card.Content>
		</a>
	</Card.Root>
</Reveal>
