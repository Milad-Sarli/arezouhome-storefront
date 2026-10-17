<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	let {
		children,
		href = '#',
		outline = false,
		class: cls = ''
	}: { children: Snippet; href?: string; outline?: boolean; class?: string } = $props();

	let el: HTMLAnchorElement;

	function onMove(e: MouseEvent) {
		const r = el.getBoundingClientRect();
		const x = e.clientX - r.left - r.width / 2;
		const y = e.clientY - r.top - r.height / 2;
		el.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
	}

	function onLeave() {
		el.style.transform = 'translate(0,0)';
	}
</script>

<a
	bind:this={el}
	{href}
	onmousemove={onMove}
	onmouseleave={onLeave}
	class={cn(
		'inline-block rounded-full px-8 py-3 font-extrabold transition-[transform,box-shadow] duration-200 will-change-transform',
		outline
			? 'border-2 border-brand bg-transparent text-brand'
			: 'bg-brand text-white hover:shadow-[0_12px_40px_rgba(47,128,237,0.45)]',
		cls
	)}
>
	{@render children()}
</a>
