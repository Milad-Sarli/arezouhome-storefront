<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { auth } from '$lib/stores/auth.svelte';
	import { faDigits } from '$lib/format/money';
	import {
		LayoutDashboard,
		Package,
		Heart,
		MapPin,
		PackageSearch,
		Scale,
		MessageCircle,
		RotateCcw,
		LogOut
	} from 'lucide-svelte';

	let { children } = $props();

	const items = [
		{ href: '/account', icon: LayoutDashboard, label: 'داشبورد', exact: true },
		{ href: '/account/orders', icon: Package, label: 'سفارش‌ها', exact: false },
		{ href: '/account/wishlist', icon: Heart, label: 'علاقه‌مندی‌ها', exact: false },
		{ href: '/compare', icon: Scale, label: 'مقایسه', exact: false },
		{ href: '/account/tickets', icon: MessageCircle, label: 'پشتیبانی', exact: false },
		{ href: '/account/returns', icon: RotateCcw, label: 'مرجوعی', exact: false },
		{ href: '/account/addresses', icon: MapPin, label: 'آدرس‌ها', exact: false },
		{ href: '/account/track', icon: PackageSearch, label: 'پیگیری سفارش', exact: false }
	];

	const isActive = $derived((href: string, exact: boolean) =>
		exact ? page.url.pathname === href : page.url.pathname.startsWith(href)
	);

	onMount(async () => {
		if (!auth.loggedIn) {
			await goto('/login?next=/account');
			return;
		}
		await auth.me();
	});

	async function logout() {
		await auth.logout();
		await goto('/');
	}
</script>

<section class="mx-auto max-w-7xl px-4 py-8">
	<div class="grid items-start gap-5 lg:grid-cols-[280px_1fr]">
		<aside class="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm lg:sticky lg:top-24 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
			<div class="flex items-center gap-3 bg-gradient-to-l from-brand via-sky-500 to-brand/60 p-5">
				<span class="display flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl text-white backdrop-blur-sm">
					{(auth.user?.name ?? 'ک').slice(0, 1)}
				</span>
				<div class="min-w-0">
					<p class="truncate font-extrabold text-white">{auth.user?.name ?? '…'}</p>
					<p class="tick mt-0.5 text-xs text-white/85" dir="ltr">{faDigits(auth.user?.phone ?? '')}</p>
				</div>
			</div>
			<nav class="flex gap-1 overflow-x-auto p-3 lg:flex-col" dir="rtl">
				{#each items as it}
					<a
						href={it.href}
						class="flex shrink-0 items-center gap-2.5 rounded-2xl px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-colors {isActive(it.href, it.exact)
							? 'bg-brand/10 text-brand-dark dark:text-brand'
							: 'text-stone-600 hover:bg-stone-100 dark:text-slate-300 dark:hover:bg-white/5'}"
					>
						<it.icon class="size-4" />
						{it.label}
					</a>
				{/each}
			</nav>
			<div class="border-t border-stone-200/70 p-3 dark:border-white/10">
				<Button
					variant="ghost"
					onclick={logout}
					class="w-full justify-start gap-2.5 rounded-2xl px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
				>
					<LogOut class="size-4" /> خروج از حساب
				</Button>
			</div>
		</aside>
		<div class="min-w-0">
			{@render children()}
		</div>
	</div>
</section>
