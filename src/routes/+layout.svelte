<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import MobileBottomNav from '$lib/components/MobileBottomNav.svelte';
	import { api } from '$lib/api/client';
	import { auth } from '$lib/stores/auth.svelte';
	import { wishlist } from '$lib/stores/wishlist.svelte';
	import { cart } from '$lib/stores/cart.svelte';
	import { theme } from '$lib/stores/theme';

	let { children } = $props();

	const bare = $derived(page.status !== 200 || page.url.pathname === '/login');

	onMount(async () => {
		await auth.me();
		if (auth.loggedIn) {
			await wishlist.syncFromCloud();
			if (cart.items.length > 0) {
				try {
					await api('/cart/sync', {
						method: 'POST',
						body: JSON.stringify({ items: cart.items.map((i) => ({ product_id: i.productId, quantity: i.qty })) })
					});
				} catch {}
			}
		}
	});
</script>

<svelte:head>
	<link rel="manifest" href="/manifest.webmanifest" />
	<link rel="apple-touch-icon" href="/favicon.svg" />
</svelte:head>

<div class="page-canvas font-sans flex min-h-screen flex-col text-[#111111] dark:text-slate-100">
	{#if !bare}
		<SiteHeader />
	{/if}
	<main class="flex-1 pb-[76px] md:pb-0">
		{@render children()}
	</main>
	{#if !bare}
		<SiteFooter />
		<MobileBottomNav />
	{/if}
	<Toaster position="bottom-center" theme={$theme} richColors closeButton />
</div>
