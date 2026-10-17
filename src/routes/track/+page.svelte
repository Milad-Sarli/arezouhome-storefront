<script lang="ts">
	import { page } from '$app/state';
	import Reveal from '$lib/components/Reveal.svelte';
	import TrackPanel from '$lib/components/TrackPanel.svelte';

	const ref = $derived(page.url.searchParams.get('ref') ?? '');
</script>

<svelte:head>
	<title>پیگیری سفارش | فروشگاه آرزو</title>
</svelte:head>

<section class="relative overflow-hidden px-4 pt-10 pb-6">
	<div class="hero-wash hero-wash-a" style="width:380px;height:280px;top:-120px;left:10%"></div>
	<div class="relative mx-auto max-w-7xl">
		<Reveal>
			<h1 class="display text-3xl md:text-4xl">پیگیری سفارش</h1>
			<p class="mt-1 text-sm text-stone-500 dark:text-slate-400">کد پیگیری رو بزن</p>
		</Reveal>
	</div>
</section>

<section class="mx-auto max-w-3xl px-4 pb-14">
	<TrackPanel initialRef={ref} />
</section>
