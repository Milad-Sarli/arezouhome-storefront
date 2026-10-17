<script lang="ts">
	let { items, class: cls = '' }: { items: string[]; class?: string } = $props();
</script>

<div class="marquee {cls}" dir="ltr" aria-hidden="true">
	<div class="marquee-track">
		{#each [...items, ...items] as item, i}
			<span class={i % 2 === 1 ? 'text-brand' : ''}>{item} ✦</span>
		{/each}
	</div>
</div>
