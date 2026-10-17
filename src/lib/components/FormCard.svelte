<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';

	let {
		title = null,
		subtitle = null,
		icon = null,
		children,
		cls = ''
	}: {
		title?: string | null;
		subtitle?: string | null;
		icon?: Component | null;
		children: Snippet;
		cls?: string;
	} = $props();
</script>

<Card.Root class="card-brand relative p-0 {cls}">
	<div class="pointer-events-none absolute -top-12 -end-12 size-36 rounded-full bg-[#3B46F2]/15 blur-2xl" aria-hidden="true"></div>
	<div class="pointer-events-none absolute -bottom-14 -start-14 size-40 rounded-full bg-[#2635D9]/12 blur-2xl" aria-hidden="true"></div>
	<div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-[#3B46F2] via-[#2635D9] to-transparent" aria-hidden="true"></div>
	<div class="relative p-4 sm:p-5">
		{#if title}
			<div class="mb-4 flex items-center gap-3">
				{#if icon}
					{@const Icon = icon}
					<span class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B46F2] to-[#2635D9] text-white shadow-[0_8px_20px_rgba(59,70,242,0.4)]">
						<Icon class="size-5" />
					</span>
				{/if}
				<span>
					<Card.Title class="display text-base text-[#1B2452] dark:text-white">{title}</Card.Title>
					{#if subtitle}
						<Card.Description class="mt-0.5 text-xs">{subtitle}</Card.Description>
					{/if}
				</span>
			</div>
		{/if}
		<Card.Content class="p-0">
			{@render children()}
		</Card.Content>
	</div>
</Card.Root>
