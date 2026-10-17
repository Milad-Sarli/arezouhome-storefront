<script lang="ts">
	import { onMount } from 'svelte';

	let { glb, usdz, poster, alt = 'مدل سه‌بعدی' }: { glb: string; usdz?: string | null; poster?: string | null; alt?: string } = $props();

	let loaded = $state(false);

	onMount(async () => {
		if (!customElements.get('model-viewer')) {
			await import('@google/model-viewer');
		}
		loaded = true;
	});
</script>

<svelte:head>
	{#if !loaded}
		<script type="module" src="https://unpkg.com/@google/model-viewer@3.4.0/dist/model-viewer.min.js"></script>
	{/if}
</svelte:head>

{#if glb}
	<div class="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
		{#if loaded}
			<!-- svelte-ignore custom_element -->
			<model-viewer
				src={glb}
				ios-src={usdz ?? undefined}
				poster={poster ?? undefined}
				alt={alt}
				ar
				ar-modes="webxr scene-viewer quick-look"
				camera-controls
				auto-rotate
				shadow-intensity="1"
				style="width:100%;height:380px;background:transparent"
			>
				<button
					slot="ar-button"
					class="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-brand px-5 py-2 text-sm font-black text-white shadow-lg"
				>
					در آشپزخانه‌ام ببین 📱
				</button>
			</model-viewer>
		{:else}
			<div class="flex h-[380px] items-center justify-center text-sm text-stone-500">در حال بارگذاری مدل سه‌بعدی…</div>
		{/if}
		<p class="p-3 text-center text-[11px] text-stone-500 dark:text-slate-400">حرکت بده، زوم کن و با دکمه AR تو آشپزخانه‌ات تست کن</p>
	</div>
{/if}
