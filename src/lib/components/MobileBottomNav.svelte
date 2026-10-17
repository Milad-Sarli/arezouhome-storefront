<script lang="ts">
	import { page } from '$app/state';
	import { House, LayoutGrid, ShoppingCart, Heart, User } from 'lucide-svelte';
	import { cart } from '$lib/stores/cart.svelte';
	import { wishlist } from '$lib/stores/wishlist.svelte';
	import { auth } from '$lib/stores/auth.svelte';
	import { faDigits } from '$lib/format/money';

	const path = $derived(page.url.pathname);
	const accountHref = $derived(auth.loggedIn ? '/account' : '/login');

	const isHome = $derived(path === '/');
	const isProducts = $derived(path === '/products' || path.startsWith('/products/') || path === '/amazings');
	const isCart = $derived(path === '/cart' || path === '/checkout');
	const isWishlist = $derived(path === '/account/wishlist' || path === '/compare');
	const isAccount = $derived(
		path === '/account' ||
			path.startsWith('/account/') ||
			path === '/login' ||
			path === '/track'
	);
</script>

<nav
	aria-label="ناوبری موبایل"
	class="fixed inset-x-0 bottom-0 z-40 border-t border-[#E2E6F3] bg-white/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/85 md:hidden dark:border-white/10 dark:bg-[#141A3D]/95 dark:supports-[backdrop-filter]:bg-[#141A3D]/85"
	style="padding-bottom: env(safe-area-inset-bottom); box-shadow: 0 -12px 40px rgba(27,36,82,0.14);"
	dir="rtl"
>
	<div class="mx-auto grid max-w-md grid-cols-5 items-end px-2 pt-1.5 pb-2">
		<!-- خانه -->
		<a
			href="/"
			aria-current={isHome ? 'page' : undefined}
			class="group flex flex-col items-center gap-1 rounded-2xl px-1 py-1.5 text-[11px] font-bold transition-colors {isHome
				? 'text-[#2635D9] dark:text-[#8B93FF]'
				: 'text-slate-500 hover:text-[#2635D9] dark:text-white/60 dark:hover:text-white'}"
		>
			<span
				class="relative flex size-9 items-center justify-center rounded-2xl transition-all {isHome
					? 'bg-[#3B46F2]/10 text-[#2635D9] dark:bg-white/10 dark:text-[#8B93FF]'
					: 'text-inherit group-active:scale-95'}"
			>
				<House class="size-5" />
			</span>
			خانه
			<span
				class="h-1 w-6 rounded-full transition-all {isHome
					? 'bg-gradient-to-l from-[#3B46F2] to-[#2635D9] opacity-100'
					: 'opacity-0'}"
			></span>
		</a>

		<!-- کالاها -->
		<a
			href="/products"
			aria-current={isProducts ? 'page' : undefined}
			class="group flex flex-col items-center gap-1 rounded-2xl px-1 py-1.5 text-[11px] font-bold transition-colors {isProducts
				? 'text-[#2635D9] dark:text-[#8B93FF]'
				: 'text-slate-500 hover:text-[#2635D9] dark:text-white/60 dark:hover:text-white'}"
		>
			<span
				class="relative flex size-9 items-center justify-center rounded-2xl transition-all {isProducts
					? 'bg-[#3B46F2]/10 text-[#2635D9] dark:bg-white/10 dark:text-[#8B93FF]'
					: 'text-inherit group-active:scale-95'}"
			>
				<LayoutGrid class="size-5" />
			</span>
			کالاها
			<span
				class="h-1 w-6 rounded-full transition-all {isProducts
					? 'bg-gradient-to-l from-[#3B46F2] to-[#2635D9] opacity-100'
					: 'opacity-0'}"
			></span>
		</a>

		<!-- سبد خرید (دکمه برجسته وسط) -->
		<a
			href="/cart"
			aria-current={isCart ? 'page' : undefined}
			aria-label="سبد خرید"
			class="group flex flex-col items-center gap-1 px-1 pb-1.5 text-[11px] font-black {isCart
				? 'text-[#2635D9] dark:text-[#8B93FF]'
				: 'text-slate-500 dark:text-white/60'}"
		>
			<span class="relative -mt-7">
				<span
					class="btn-electric flex size-14 items-center justify-center rounded-full ring-4 ring-white transition-transform group-active:scale-95 dark:ring-[#141A3D] {isCart
						? 'scale-105'
						: ''}"
				>
					<ShoppingCart class="size-6" />
				</span>
				{#if cart.count > 0}
					<span
						class="tick badge-pulse absolute -top-1 -left-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#111111] px-1 text-[11px] font-black text-white ring-2 ring-white dark:bg-white dark:text-[#1B2452] dark:ring-[#141A3D]"
					>
						{faDigits(cart.count > 99 ? '99+' : cart.count)}
					</span>
				{/if}
			</span>
			سبد خرید
		</a>

		<!-- علاقه‌مندی‌ها -->
		<a
			href="/account/wishlist"
			aria-current={isWishlist ? 'page' : undefined}
			class="group flex flex-col items-center gap-1 rounded-2xl px-1 py-1.5 text-[11px] font-bold transition-colors {isWishlist
				? 'text-[#2635D9] dark:text-[#8B93FF]'
				: 'text-slate-500 hover:text-[#2635D9] dark:text-white/60 dark:hover:text-white'}"
		>
			<span
				class="relative flex size-9 items-center justify-center rounded-2xl transition-all {isWishlist
					? 'bg-[#3B46F2]/10 text-[#2635D9] dark:bg-white/10 dark:text-[#8B93FF]'
					: 'text-inherit group-active:scale-95'}"
			>
				<Heart class="size-5" />
				{#if wishlist.count > 0}
					<span
						class="tick absolute -top-1 -left-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-0.5 text-[10px] font-black text-white ring-2 ring-white dark:ring-[#141A3D]"
					>
						{faDigits(wishlist.count > 99 ? '99+' : wishlist.count)}
					</span>
				{/if}
			</span>
			علاقه‌مندی
			<span
				class="h-1 w-6 rounded-full transition-all {isWishlist
					? 'bg-gradient-to-l from-[#3B46F2] to-[#2635D9] opacity-100'
					: 'opacity-0'}"
			></span>
		</a>

		<!-- حساب من -->
		<a
			href={accountHref}
			aria-current={isAccount ? 'page' : undefined}
			class="group flex flex-col items-center gap-1 rounded-2xl px-1 py-1.5 text-[11px] font-bold transition-colors {isAccount
				? 'text-[#2635D9] dark:text-[#8B93FF]'
				: 'text-slate-500 hover:text-[#2635D9] dark:text-white/60 dark:hover:text-white'}"
		>
			<span
				class="relative flex size-9 items-center justify-center rounded-2xl transition-all {isAccount
					? 'bg-[#3B46F2]/10 text-[#2635D9] dark:bg-white/10 dark:text-[#8B93FF]'
					: 'text-inherit group-active:scale-95'}"
			>
				<User class="size-5" />
				{#if auth.loggedIn}
					<span
						class="absolute top-1 right-1 size-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#141A3D]"
						aria-hidden="true"
					></span>
				{/if}
			</span>
			{auth.loggedIn ? 'حساب من' : 'ورود'}
			<span
				class="h-1 w-6 rounded-full transition-all {isAccount
					? 'bg-gradient-to-l from-[#3B46F2] to-[#2635D9] opacity-100'
					: 'opacity-0'}"
			></span>
		</a>
	</div>
</nav>
