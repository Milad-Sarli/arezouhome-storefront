<script lang="ts">
	import { page } from '$app/state';
	import MagneticButton from '$lib/components/MagneticButton.svelte';
	import Reveal from '$lib/components/Reveal.svelte';

	const status = $derived(page.status);
	const is404 = $derived(status === 404);
</script>

<svelte:head>
	<title>{status} | فروشگاه آرزو</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="relative flex min-h-[calc(100svh-65px)] items-center justify-center overflow-hidden px-4 py-16 text-center">
	<div
		class="hero-wash hero-wash-a"
		style="width:420px;height:420px;top:-140px;right:-100px"
	></div>
	<div
		class="hero-wash hero-wash-b"
		style="width:380px;height:380px;bottom:-160px;left:-100px;animation-delay:-6s"
	></div>

	<div class="relative mx-auto max-w-2xl">
		<Reveal>
			<div class="display tick" style="font-size:clamp(5rem,18vw,10rem);line-height:1">
				{status}
			</div>
		</Reveal>
		<Reveal delay={120}>
			<h1 class="display mt-2 text-2xl md:text-3xl">
				{#if is404}
					این صفحه انگار از آشپزخونه <span class="text-stroke">پریده بیرون!</span>
				{:else}
					یه مشکلی پیش اومد!
				{/if}
			</h1>
			<p class="mx-auto mt-3 max-w-md text-sm text-stone-500 dark:text-slate-400">
				{#if is404}
					آدرسی که دنبالشی وجود نداره یا جابه‌جا شده. بذار برگردیم سر سفره اصلی.
				{:else}
					خطای {status} — اگه دوباره دیدیش به پشتیبانی خبر بده تا درستش کنیم.
				{/if}
			</p>
		</Reveal>
		<Reveal delay={220}>
			<div class="mt-8 flex flex-wrap justify-center gap-3">
				<MagneticButton href="/">برگرد خونه 🏠</MagneticButton>
				<MagneticButton href="/products" outline={true}>دیدن کالاها</MagneticButton>
			</div>
		</Reveal>
		<Reveal delay={300}>
			<div class="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-stone-500 dark:text-slate-500">
				<a href="/track" class="hover:text-brand">پیگیری سفارش</a>
				<a href="/contact" class="hover:text-brand">تماس با ما</a>
				<a href="/blog" class="hover:text-brand">بلاگ</a>
			</div>
		</Reveal>
	</div>
</section>
