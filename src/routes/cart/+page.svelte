<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import Reveal from '$lib/components/Reveal.svelte';
	import { auth } from '$lib/stores/auth.svelte';
	import { cart } from '$lib/stores/cart.svelte';
	import ForYou from '$lib/components/ForYou.svelte';
	import { toman, faDigits } from '$lib/format/money';
	import { api } from '$lib/api/client';
	import { fileUrl } from '$lib/api/files';
	import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';

	function checkout() {
		goto(auth.loggedIn ? '/checkout' : '/login?next=/checkout');
	}

	onMount(async () => {
		const placeholders = cart.items.filter((i) => i.price === 0);
		if (placeholders.length === 0) return;
		try {
			const ids = placeholders.map((i) => i.productId).join(',');
			const res = await api<{ data: { id: number; name: string; final_price_rial: number; price_rial: number; image: string | null }[] }>(`/products?ids=${ids}`);
			for (const p of res.data ?? []) {
				const key = `${p.id}:0`;
				const found = cart.items.find((x) => x.key === key);
				if (found) {
					found.name = p.name;
					found.price = p.final_price_rial;
					found.wasPrice = p.price_rial > p.final_price_rial ? p.price_rial : found.wasPrice;
					found.image = fileUrl(p.image) ?? found.image;
				}
			}
		} catch {
			/* ignore */
		}
	});
</script>

<SeoHead title="سبد خرید" description="سبد خرید فروشگاه آرزو — بازبینی کالاها و ادامه تسویه" noindex />

<section class="mx-auto max-w-6xl px-4 py-8">
	<h1 class="display text-3xl text-stone-900 dark:text-white">سبد خرید</h1>
	<p class="mt-1 text-sm text-stone-500 dark:text-slate-400">{faDigits(cart.count)} کالا</p>

	{#if cart.items.length === 0}
		<Card.Root class="mt-6 text-center">
			<Card.Content class="flex flex-col items-center gap-3 py-12">
				<ShoppingBag class="size-10 text-stone-300 dark:text-slate-600" />
				<p class="font-bold text-stone-600 dark:text-slate-300">سبدت خالیه</p>
				<p class="text-sm text-stone-500 dark:text-slate-400">بریم یه نگاهی به کالاها بندازیم؟</p>
				<Button href="/products" class="mt-2 rounded-full bg-brand font-bold text-white hover:bg-brand">
					دیدن کالاها
				</Button>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
			<div class="flex flex-col gap-4">
				{#each cart.items as item (item.key)}
					<Reveal>
						<Card.Root class="group overflow-hidden rounded-3xl transition-shadow hover:shadow-[0_16px_40px_rgba(47,128,237,0.12)]">
							<Card.Content class="flex gap-4 p-4">
								<div class="relative shrink-0">
									<div class="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(120px_90px_at_50%_30%,rgba(47,128,237,0.14),transparent)] dark:bg-white/[0.05]">
										{#if item.image}
											<img src={item.image} alt={item.name} width="112" height="112" loading="lazy" decoding="async" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
										{:else}
											<ShoppingBag class="size-10 text-stone-300 dark:text-slate-600" />
										{/if}
									</div>
									{#if item.wasPrice && item.wasPrice > item.price}
										<span class="tick absolute -top-2 -right-2 -rotate-3 rounded-full bg-gradient-to-l from-red-500 to-rose-500 px-2 py-0.5 text-[10px] font-black text-white shadow-lg shadow-red-500/30">
											٪{Math.round(((item.wasPrice - item.price) / item.wasPrice) * 100).toLocaleString('fa-IR')}
										</span>
									{/if}
								</div>
								<div class="flex min-w-0 flex-1 flex-col">
									<div class="flex items-start justify-between gap-2">
										<p class="line-clamp-2 text-sm leading-6 font-extrabold text-stone-800 dark:text-slate-100">{item.name}</p>
										<button
											type="button"
											class="flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
											onclick={() => cart.setQty(item.key, 0)}
											aria-label="حذف"
										>
											<Trash2 class="size-3.5" /> حذف
										</button>
									</div>
									<div class="mt-1 flex items-center gap-2 text-[11px] text-stone-500 dark:text-slate-400">
										{#if item.color}
											<span class="rounded-full bg-stone-100 px-2 py-0.5 font-bold dark:bg-white/10">{item.color}</span>
										{/if}
										{#if item.price === 0}
											<span class="tick animate-pulse rounded bg-stone-200 px-2 py-0.5 dark:bg-white/10">در حال بارگذاری…</span>
										{:else}
											<span class="tick">واحد: {toman(item.price)}</span>
										{/if}
									</div>
									<div class="mt-auto flex items-center justify-between pt-3">
										<div class="flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 p-1 dark:border-white/15 dark:bg-white/5">
											<button
												type="button"
												class="flex size-7 items-center justify-center rounded-full bg-white shadow-sm transition-all hover:bg-brand hover:text-white dark:bg-white/10 dark:hover:bg-brand"
												onclick={() => cart.setQty(item.key, item.qty + 1)}
												aria-label="افزایش"
											>
												<Plus class="size-4" />
											</button>
											<span class="tick min-w-7 text-center text-sm font-black">{faDigits(item.qty)}</span>
											<button
												type="button"
												class="flex size-7 items-center justify-center rounded-full bg-white shadow-sm transition-all hover:bg-brand hover:text-white dark:bg-white/10 dark:hover:bg-brand"
												onclick={() => cart.setQty(item.key, item.qty - 1)}
												aria-label="کاهش"
											>
												<Minus class="size-4" />
											</button>
										</div>
										<div class="text-left">
											{#if item.price === 0}
												<div class="h-4 w-20 animate-pulse rounded bg-stone-200 dark:bg-white/10"></div>
											{:else}
												{#if item.wasPrice && item.wasPrice > item.price}
													<div class="tick text-[11px] text-stone-400 line-through dark:text-slate-500">{toman(item.wasPrice * item.qty)}</div>
												{/if}
												<p class="font-toman text-base font-black text-brand-dark dark:text-brand">{toman(item.price * item.qty)}</p>
											{/if}
										</div>
									</div>
								</div>
							</Card.Content>
						</Card.Root>
					</Reveal>
				{/each}
			</div>
			<div>
				<Card.Root class="lg:sticky lg:top-24">
					<Card.Header>
						<Card.Title class="text-base">خلاصه سبد</Card.Title>
					</Card.Header>
					<Card.Content class="flex flex-col gap-2 text-sm">
						<div class="flex justify-between text-stone-600 dark:text-slate-300">
							<span>جمع کالاها</span>
							<span class="font-toman font-bold">{toman(cart.total)}</span>
						</div>
						<div class="flex justify-between text-stone-600 dark:text-slate-300">
							<span>هزینه ارسال</span>
							<span>در مرحله بعد</span>
						</div>
						<Separator class="my-1" />
						<div class="flex justify-between font-bold">
							<span>قابل پرداخت</span>
							<span class="font-toman text-brand-dark dark:text-brand">{toman(cart.total)}</span>
						</div>
						<Button onclick={checkout} class="mt-2 w-full rounded-full bg-brand font-extrabold text-white hover:bg-brand">
							ادامه و تسویه
						</Button>
						<p class="mt-1 text-center text-[11px] font-bold text-stone-500 dark:text-slate-400">
							✓ ضمانت اصالت کالا &nbsp;•&nbsp; ✓ پرداخت امن
						</p>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	{/if}
</section>

{#if cart.items.length > 0}
	<ForYou />
{/if}
