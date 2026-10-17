<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Search } from 'lucide-svelte';
	import { api } from '$lib/api/client';
	import { fileUrl } from '$lib/api/files';
	import { toman, faDigits } from '$lib/format/money';
	import type { Paginated, Product } from '$lib/api/types';

	let {
		placeholder = 'جستجو…',
		inputClass = '',
		onnavigate = undefined
	}: {
		placeholder?: string;
		inputClass?: string;
		onnavigate?: (() => void) | undefined;
	} = $props();

	let q = $state('');
	let open = $state(false);
	let items = $state<Product[]>([]);
	let total = $state(0);
	let timer: ReturnType<typeof setTimeout> | null = null;
	let box = $state<HTMLDivElement | null>(null);

	// close on navigation
	$effect(() => {
		void page.url.pathname;
		void page.url.search;
		open = false;
	});

	function schedule(v: string) {
		if (timer) clearTimeout(timer);
		const query = v.trim();
		if (query.length < 2) {
			items = [];
			total = 0;
			return;
		}
		timer = setTimeout(async () => {
			try {
				const res = await api<Paginated<Product>>(`/products?search=${encodeURIComponent(query)}`);
				// ignore stale responses
				if (q.trim() !== query) return;
				items = res.data.slice(0, 6);
				total = res.meta.total;
				open = true;
			} catch {
				items = [];
			}
		}, 300);
	}

	function go(url: string) {
		open = false;
		q = '';
		items = [];
		onnavigate?.();
		goto(url);
	}

	function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!q.trim()) return;
		go(`/products?search=${encodeURIComponent(q.trim())}`);
	}
</script>

<svelte:window
	onclick={(e) => {
		if (box && !box.contains(e.target as Node)) open = false;
	}}
/>

<div bind:this={box} class="relative" dir="rtl">
	<form onsubmit={submit} class="relative">
		<Input
			bind:value={q}
			oninput={() => {
				open = true;
				schedule(q);
			}}
			onkeydown={(e) => {
				if (e.key === 'Escape') open = false;
			}}
			onfocus={() => {
				if (items.length > 0) open = true;
			}}
			placeholder={placeholder}
			autocomplete="off"
			class={inputClass}
		/>
		<button type="submit" aria-label="جستجو" class="absolute top-1/2 right-3 -translate-y-1/2 text-stone-400">
			<Search class="size-4" />
		</button>
	</form>
	{#if open && q.trim().length >= 2}
		<div class="absolute inset-x-0 top-full z-[80] mt-2 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-panel dark:shadow-none">
			{#if items.length === 0}
				<p class="px-4 py-5 text-center text-xs text-stone-500 dark:text-slate-400">چیزی پیدا نشد — اینتر بزن برای جستجوی کامل</p>
			{:else}
				{#each items as p (p.id)}
					<button
						type="button"
						onclick={() => go(`/products/${p.slug}`)}
						class="flex w-full items-center gap-3 px-3 py-2 text-right transition-colors hover:bg-stone-50 dark:hover:bg-white/5"
					>
						{#if fileUrl(p.image)}
							<img src={fileUrl(p.image)} alt="" width="48" height="48" loading="lazy" decoding="async" class="h-12 w-12 shrink-0 rounded-xl bg-stone-50 object-cover dark:bg-white/5" />
						{/if}
						<span class="min-w-0 flex-1">
							<span class="block truncate text-xs font-bold text-stone-800 dark:text-slate-100">{p.name}</span>
							<span class="font-toman mt-0.5 block text-[11px] font-bold text-brand-dark dark:text-brand">{toman(p.final_price_rial)}</span>
						</span>
					</button>
				{/each}
				<button
					type="button"
					onclick={() => go(`/products?search=${encodeURIComponent(q.trim())}`)}
					class="tick w-full border-t border-stone-100 px-3 py-2.5 text-center text-xs font-bold text-brand-dark hover:bg-stone-50 dark:border-white/10 dark:text-brand dark:hover:bg-white/5"
				>
					نمایش همه {faDigits(total)} نتیجه ←
				</button>
			{/if}
		</div>
	{/if}
</div>
