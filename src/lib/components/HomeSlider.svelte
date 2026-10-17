<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fileUrl } from '$lib/api/files';
	import SmartImage from './SmartImage.svelte';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	interface Slide {
		image: string | null;
		title: string | null;
		description: string | null;
		link: string | null;
		button_title: string | null;
		button_link: string | null;
	}

	let { slides }: { slides: Slide[] } = $props();

	let index = $state(0);
	let timer: ReturnType<typeof setInterval> | null = null;

	function start() {
		if (slides.length <= 1) return;
		timer = setInterval(() => {
			index = (index + 1) % slides.length;
		}, 4500);
	}

	function stop() {
		if (timer) clearInterval(timer);
		timer = null;
	}

	onMount(start);
	onDestroy(stop);

	function go(i: number) {
		index = i;
		stop();
		start();
	}
</script>

{#if slides.length > 0}
	<div class="relative overflow-hidden rounded-[28px] border border-stone-200/60 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:border-white/[0.06] dark:bg-white/[0.035]" dir="ltr">
		<div class="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" style="transform: translateX({-index * 100}%)">
			{#each slides as s (s.image)}
				<a
					href={s.button_link || s.link || '/products'}
					class="relative flex min-w-full items-center overflow-hidden"
					dir="rtl"
				>
					<div class="flex min-h-[220px] flex-1 flex-col justify-center gap-2 p-6 sm:min-h-[260px] sm:p-8">
						{#if s.title}
							<h3 class="display text-xl leading-8 sm:text-2xl">{s.title}</h3>
						{/if}
						{#if s.description}
							<p class="text-sm text-stone-500 dark:text-slate-400">{s.description}</p>
						{/if}
						{#if s.button_title}
							<span class="mt-2 inline-flex w-fit rounded-full bg-brand px-5 py-2 text-xs font-black text-white">
								{s.button_title}
							</span>
						{/if}
					</div>
					{#if fileUrl(s.image)}
						<SmartImage
							src={s.image}
							alt={s.title ?? ''}
							widths={[320, 640]}
							sizes="(max-width: 640px) 50vw, 256px"
							width={400}
							height={260}
							imgClass="hidden h-56 w-56 shrink-0 object-contain p-4 sm:block sm:h-64 sm:w-64"
						/>
					{/if}
				</a>
			{/each}
		</div>

		<button
			type="button"
			onclick={() => go((index - 1 + slides.length) % slides.length)}
			aria-label="قبلی"
			class="absolute top-1/2 left-3 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md backdrop-blur-sm hover:bg-white sm:flex dark:bg-white/10 dark:hover:bg-white/15"
		>
			<ChevronLeft class="size-4" />
		</button>
		<button
			type="button"
			onclick={() => go((index + 1) % slides.length)}
			aria-label="بعدی"
			class="absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md backdrop-blur-sm hover:bg-white sm:flex dark:bg-white/10 dark:hover:bg-white/15"
		>
			<ChevronRight class="size-4" />
		</button>

		<div class="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
			{#each slides as _, i}
				<button
					type="button"
					onclick={() => go(i)}
					aria-label="اسلاید {i + 1}"
					class="h-1.5 rounded-full transition-all {i === index ? 'w-6 bg-brand' : 'w-1.5 bg-stone-300 dark:bg-white/30'}"
				></button>
			{/each}
		</div>
	</div>
{/if}
