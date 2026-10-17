<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';

	let {
		value = $bindable(''),
		placeholder = '',
		label = '',
		onvalue = undefined
	}: {
		value?: string;
		placeholder?: string;
		label?: string;
		onvalue?: (() => void) | undefined;
	} = $props();

	function toLatinDigits(raw: string): string {
		return raw
			.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
			.replace(/[^\d]/g, '');
	}

	function toGrouped(raw: string): string {
		const digits = toLatinDigits(raw);
		if (!digits) return '';
		return Number(digits).toLocaleString('fa-IR');
	}

	function oninput(e: Event) {
		value = toLatinDigits((e.currentTarget as HTMLInputElement).value);
		onvalue?.();
	}
</script>

<div>
	{#if label}
		<div class="mb-1.5 text-xs font-bold text-stone-500 dark:text-slate-400">{label}</div>
	{/if}
	<Input
		value={toGrouped(value)}
		{oninput}
		{placeholder}
		inputmode="numeric"
		class="tick border-stone-300 bg-white dark:border-white/15 dark:bg-white/5"
	/>
</div>
