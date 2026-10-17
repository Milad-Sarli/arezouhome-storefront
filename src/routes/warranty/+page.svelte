<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import Reveal from '$lib/components/Reveal.svelte';
	import { ShieldCheck, RotateCcw, Truck, BadgeCheck } from 'lucide-svelte';

	const items = [
		{
			icon: ShieldCheck,
			title: 'گارانتی شرکتی',
			body: 'همه کالاهای برقی با گارانتی رسمی شرکتی عرضه میشن. مدت و شرایط گارانتی هر کالا تو صفحه خودش نوشته شده؛ کارت گارانتی همراه کالا ارسال میشه.'
		},
		{
			icon: RotateCcw,
			title: '۷ روز مرجوعی',
			body: 'تا ۷ روز بعد از تحویل، اگه کالا استفاده نشده باشه و بسته‌بندیش سالم باشه، بدون قید و شرط پس می‌گیریم و پول رو برمی‌گردونیم.'
		},
		{
			icon: Truck,
			title: 'تحویل سالم',
			body: 'موقع تحویل حتما بسته‌بندی رو چک کن. اگه آسیب‌دیدگی دیدی همون‌جا تحویل نگیر و بهمون زنگ بزن تا سریع جایگزین بفرستیم.'
		},
		{
			icon: BadgeCheck,
			title: 'ضمانت اصالت',
			body: 'همه کالاها مستقیم از نمایندگی رسمی تأمین میشن. اگه خلافش ثابت بشه، دو برابر مبلغ رو پس می‌گیری.'
		}
	];
</script>

<svelte:head>
	<title>گارانتی و مرجوعی | فروشگاه آرزو</title>
</svelte:head>

<section class="relative overflow-hidden px-4 pt-10 pb-6">
	<div class="hero-wash hero-wash-a" style="width:380px;height:280px;top:-120px;left:10%"></div>
	<div class="relative mx-auto max-w-7xl">
		<Reveal>
			<h1 class="display text-3xl md:text-4xl">گارانتی و مرجوعی</h1>
			<p class="mt-1 text-sm text-stone-500 dark:text-slate-400">خیالت راحت، پشت کالاهامون وایمیسیم</p>
		</Reveal>
	</div>
</section>

<section class="mx-auto max-w-7xl px-4 pb-14">
	<div class="grid gap-4 sm:grid-cols-2">
		{#each items as item, i (item.title)}
			<Reveal delay={(i % 2) * 80} class="h-full">
				<Card.Root class="h-full rounded-3xl">
					<Card.Content class="flex h-full items-start gap-3 p-5">
						<span class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
							<item.icon class="size-5" />
						</span>
						<span>
							<span class="block font-extrabold text-stone-900 dark:text-white">{item.title}</span>
							<span class="mt-1 block text-sm leading-7 text-stone-600 dark:text-slate-300">{item.body}</span>
						</span>
					</Card.Content>
				</Card.Root>
			</Reveal>
		{/each}
	</div>
</section>
