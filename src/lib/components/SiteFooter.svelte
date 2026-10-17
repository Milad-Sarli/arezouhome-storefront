<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { ApiError, api } from '$lib/api/client';
	import Reveal from './Reveal.svelte';
	import { MapPin, Phone, ShieldCheck, Truck, CreditCard, Headset } from 'lucide-svelte';

	let phone = $state('');
	let done = $state(false);
	let busy = $state(false);
	let error = $state<string | null>(null);

	async function subscribe(e: SubmitEvent) {
		e.preventDefault();
		error = null;
		if (!/^09\d{9}$/.test(phone.trim())) {
			error = 'شماره موبایل رو درست وارد کن';
			return;
		}
		busy = true;
		try {
			await api('/newsletter', {
				method: 'POST',
				body: JSON.stringify({ phone: phone.trim() })
			});
			done = true;
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'ثبت ناموفق بود. دوباره تلاش کن.';
		} finally {
			busy = false;
		}
	}
</script>

<footer class="relative mt-10 overflow-hidden bg-[#111111] text-[#F7F8FC]">
	<!-- top electric edge -->
	<div class="h-1.5 bg-gradient-to-l from-[#3B46F2] via-[#2635D9] to-[#3B46F2]"></div>
	<div class="navy-surface navy-glow relative">
		<div class="pattern-dots absolute inset-0 opacity-30"></div>
		<div class="pattern-rings absolute inset-0 opacity-60"></div>
		<div class="absolute -top-16 left-1/3 size-56 rounded-full bg-[#3B46F2]/30 blur-[90px]"></div>

		<div class="relative mx-auto max-w-7xl px-4 pt-12 pb-6">
			<!-- newsletter hero card (shadcn Card) -->
			<Reveal>
				<Card.Root class="relative overflow-hidden border-white/15 bg-gradient-to-l from-[#3B46F2] via-[#2635D9] to-[#1B2452] shadow-[0_24px_70px_rgba(59,70,242,0.45)]">
					<div class="pattern-stripes absolute inset-0 opacity-50"></div>
					<div class="absolute -top-20 -left-20 size-64 rounded-full border-[26px] border-white/10"></div>
					<div class="absolute -bottom-24 -right-16 size-72 rounded-full border-[30px] border-white/10"></div>
					<Card.Content class="relative grid items-center gap-6 p-6 md:grid-cols-2 md:p-10">
						<div>
							<div class="display text-2xl text-white md:text-4xl">آرزو<span class="text-white/60">.</span> خبرهای جشنواره رو اول بگیر</div>
							<p class="mt-2 text-[13px] leading-6 text-white/75">عضویت در پیامک آرزو — تخفیف‌های شگفت‌انگیز، موجودشدن کالا و جشنواره جهیزیه.</p>
							<div class="mt-4 flex flex-wrap gap-2">
								<Badge variant="outline" class="border-white/25 bg-white/10 font-bold text-white/85 hover:bg-white/10 hover:text-white">✓ بدون اسپم</Badge>
								<Badge variant="outline" class="border-white/25 bg-white/10 font-bold text-white/85 hover:bg-white/10 hover:text-white">✓ لغو هر وقت خواستی</Badge>
							</div>
						</div>
						<div>
							{#if done}
								<p class="rounded-2xl border border-white/30 bg-white/15 px-4 py-4 text-center text-sm font-black text-white backdrop-blur-md">
									عضویتت ثبت شد؛ به‌زودی خبرهای خوب میاد 🎉
								</p>
							{:else}
								<form onsubmit={subscribe} class="flex flex-col gap-2 sm:flex-row" dir="rtl">
									<Input
										bind:value={phone}
										inputmode="tel"
										placeholder="09xxxxxxxxx"
										class="tick h-12 rounded-2xl border-white/25 bg-white/95 text-center font-black text-[#1B2452] placeholder:text-slate-400"
									/>
									<Button type="submit" disabled={busy} class="h-12 rounded-2xl bg-[#111111] px-8 font-black text-white hover:bg-black">
										{busy ? '...' : 'عضویت'}
									</Button>
								</form>
								{#if error}
									<p class="mt-2 text-xs font-bold text-amber-200">{error}</p>
								{/if}
							{/if}
						</div>
					</Card.Content>
				</Card.Root>
			</Reveal>

			<!-- link columns -->
			<div class="mt-10 grid gap-8 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
				<div>
					<div class="flex items-center gap-2.5">
						<span class="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B46F2] to-[#2635D9] text-xl font-black text-white ring-1 ring-white/25">آ</span>
						<span>
							<span class="display block text-xl text-white">آرزو<span class="text-[#8B93FF]">.</span></span>
							<span class="block text-[10px] font-bold tracking-widest text-white/50">AREZOU HOME</span>
						</span>
					</div>
					<p class="mt-3 max-w-xs text-[13px] leading-6 text-white/65">فروشگاه لوازم خانگی آرزو — یخچال، لباسشویی، تلویزیون و جهیزیه کامل با گارانتی شرکتی و ارسال به سراسر کشور.</p>
					<div class="mt-4 flex items-center gap-2 text-[12px] text-white/70">
						<MapPin class="size-4 text-[#8B93FF]" /> گرگان، خیابان اصلی
					</div>
					<div class="mt-1.5 flex items-center gap-2 text-[12px] text-white/70">
						<Phone class="size-4 text-[#8B93FF]" /> <span class="tick" dir="ltr">017 - 000 0000</span>
					</div>
				</div>
				<div>
					<div class="text-sm font-black text-white">دسترسی سریع</div>
					<div class="mt-1 h-1 w-10 rounded-full bg-gradient-to-l from-[#3B46F2] to-[#2635D9]"></div>
					<nav class="mt-3 flex flex-col gap-2 text-[13px] font-bold text-white/65">
						<a href="/products" class="transition-colors hover:text-white">همه کالاها</a>
						<a href="/amazings" class="transition-colors hover:text-white">شگفت‌انگیزها</a>
						<a href="/blog" class="transition-colors hover:text-white">بلاگ و راهنمای خرید</a>
						<a href="/track" class="transition-colors hover:text-white">پیگیری سفارش</a>
					</nav>
				</div>
				<div>
					<div class="text-sm font-black text-white">خدمات مشتریان</div>
					<div class="mt-1 h-1 w-10 rounded-full bg-gradient-to-l from-[#3B46F2] to-[#2635D9]"></div>
					<nav class="mt-3 flex flex-col gap-2 text-[13px] font-bold text-white/65">
						<a href="/about" class="transition-colors hover:text-white">درباره ما</a>
						<a href="/warranty" class="transition-colors hover:text-white">گارانتی و مرجوعی</a>
						<a href="/contact" class="transition-colors hover:text-white">تماس با ما</a>
						<a href="/login" class="transition-colors hover:text-white">ورود / ثبت‌نام</a>
					</nav>
				</div>
				<div>
					<div class="text-sm font-black text-white">اعتماد شما</div>
					<div class="mt-1 h-1 w-10 rounded-full bg-gradient-to-l from-[#3B46F2] to-[#2635D9]"></div>
					<div class="mt-3 grid grid-cols-2 gap-2">
						{#each [{icon: Truck, t:'ارسال سراسری'}, {icon: ShieldCheck, t:'گارانتی شرکتی'}, {icon: CreditCard, t:'پرداخت امن'}, {icon: Headset, t:'پشتیبانی واقعی'}] as b}
							{@const Icon = b.icon}
							<div class="flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.06] px-3 py-2.5">
								<Icon class="size-4 shrink-0 text-[#8B93FF]" />
								<span class="text-[11px] font-black text-white/80">{b.t}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<Separator class="mt-8 bg-white/10" />
			<div class="mt-8 flex flex-col gap-3 pt-1 text-[11px] font-bold text-white/50 md:flex-row md:items-center md:justify-between">
				<p>© ۱۴۰۵ آرزو هوم — همه حقوق محفوظ است.</p>
				<p class="flex items-center gap-2">
					<Badge variant="outline" class="border-white/15 bg-white/[0.06] font-bold text-white/60 hover:bg-white/[0.06] hover:text-white/60">نماد اعتماد</Badge>
					<Badge variant="outline" class="border-white/15 bg-white/[0.06] font-bold text-white/60 hover:bg-white/[0.06] hover:text-white/60">درگاه امن</Badge>
					<Badge class="hidden border-0 bg-[#3B46F2] text-white hover:bg-[#3B46F2] sm:inline-flex">ساخته‌شده با 💙 در گرگان</Badge>
				</p>
			</div>
		</div>
	</div>
</footer>
