<script lang="ts">
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import Reveal from '$lib/components/Reveal.svelte';
	import { ApiError, api } from '$lib/api/client';
	import type { Settings } from '$lib/api/types';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { Phone, Mail, MapPin, Clock, Send } from 'lucide-svelte';

	let settings = $state<Settings>({});
	let loading = $state(true);

	onMount(async () => {
		try {
			settings = await api<Settings>('/settings');
		} catch (err) {
			console.error(err instanceof ApiError ? err.message : err);
		} finally {
			loading = false;
		}
	});

	const cards = $derived(
		[
			{ icon: Phone, title: 'تلفن', value: settings.contact_phone, href: settings.contact_phone ? `tel:${settings.contact_phone}` : null },
			{ icon: Mail, title: 'ایمیل', value: settings.contact_email, href: settings.contact_email ? `mailto:${settings.contact_email}` : null },
			{ icon: MapPin, title: 'نشانی', value: settings.contact_address, href: null },
			{ icon: Clock, title: 'ساعت کاری', value: settings.working_hours, href: null }
		].filter((c) => c.value)
	);
</script>

<svelte:head>
	<title>تماس با ما | فروشگاه آرزو</title>
</svelte:head>

<section class="relative overflow-hidden px-4 pt-10 pb-6">
	<div class="hero-wash hero-wash-a" style="width:380px;height:280px;top:-120px;left:10%"></div>
	<div class="relative mx-auto max-w-7xl">
		<Reveal>
			<h1 class="display text-3xl md:text-4xl">تماس با ما</h1>
			<p class="mt-1 text-sm text-stone-500 dark:text-slate-400">جواب‌مون رو می‌گیری، قول می‌دیم</p>
		</Reveal>
	</div>
</section>

<section class="mx-auto max-w-7xl px-4 pb-14">
	{#if loading}
		<div class="grid gap-4 sm:grid-cols-2">
			<Skeleton class="h-40 rounded-3xl" />
			<Skeleton class="h-40 rounded-3xl" />
			<Skeleton class="h-40 rounded-3xl" />
			<Skeleton class="h-40 rounded-3xl" />
		</div>
	{:else if cards.length === 0}
		<p class="rounded-3xl border border-dashed border-stone-300 p-12 text-center text-sm text-stone-500 dark:border-white/15 dark:text-slate-400">
			اطلاعات تماس به‌زودی اینجا قرار می‌گیره
		</p>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2">
			{#each cards as c, i (c.title)}
				<Reveal delay={(i % 2) * 80}>
					<Card.Root class="rounded-3xl">
						<Card.Content class="flex items-start gap-3 p-5">
							<span class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand-dark dark:text-brand">
								<c.icon class="size-5" />
							</span>
							<span>
								<span class="block text-xs font-bold text-stone-500 dark:text-slate-400">{c.title}</span>
								{#if c.href}
									<a href={c.href} class="tick mt-1 block font-extrabold text-stone-900 hover:text-brand-dark dark:text-white dark:hover:text-brand" dir="auto">{c.value}</a>
								{:else}
									<span class="mt-1 block leading-7 font-extrabold text-stone-900 dark:text-white">{c.value}</span>
								{/if}
							</span>
						</Card.Content>
					</Card.Root>
				</Reveal>
			{/each}
		</div>
		{#if settings.telegram || settings.instagram || settings.whatsapp}
			<div class="mt-6 flex items-center justify-center gap-3 text-sm">
				<Send class="size-4 text-stone-400" />
				{#if settings.telegram}<a href={settings.telegram} class="font-bold text-brand-dark hover:underline dark:text-brand">تلگرام</a>{/if}
				{#if settings.instagram}<a href={settings.instagram} class="font-bold text-brand-dark hover:underline dark:text-brand">اینستاگرام</a>{/if}
				{#if settings.whatsapp}<a href={settings.whatsapp} class="font-bold text-brand-dark hover:underline dark:text-brand">واتساپ</a>{/if}
			</div>
		{/if}
	{/if}
</section>
