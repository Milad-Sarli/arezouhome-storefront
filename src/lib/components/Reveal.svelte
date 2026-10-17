<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		class: cls = '',
		delay = 0
	}: { children: Snippet; class?: string; delay?: number } = $props();

	let el: HTMLElement;

	$effect(() => {
		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (e.isIntersecting) {
						el.classList.add('on');
						io.disconnect();
					}
				});
			},
			{ threshold: 0.12 }
		);
		io.observe(el);
		return () => io.disconnect();
	});
</script>

<div bind:this={el} class="reveal {cls}" style="transition-delay:{delay}ms">
	{@render children()}
</div>
