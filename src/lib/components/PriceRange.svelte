<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { toman } from '$lib/format/money';

	let {
		min = $bindable(''),
		max = $bindable(''),
		onchange = undefined
	}: {
		min?: string;
		max?: string;
		onchange?: (() => void) | undefined;
	} = $props();

	const LIMIT = 100000000; // 10M toman rial
	const STEP = 500000;

	function toNum(s: string): number {
		const n = Number(s.replace(/[^\d]/g, ''));
		return Number.isFinite(n) ? n : 0;
	}

	function toGrouped(raw: string): string {
		const d = raw.replace(/[^\d]/g, '');
		if (!d) return '';
		return Number(d).toLocaleString('fa-IR');
	}

	function onMinInput(e: Event) {
		const v = (e.currentTarget as HTMLInputElement).value.replace(/[^\d]/g, '');
		min = v;
		onchange?.();
	}

	function onMaxInput(e: Event) {
		const v = (e.currentTarget as HTMLInputElement).value.replace(/[^\d]/g, '');
		max = v;
		onchange?.();
	}

	const minVal = $derived(toNum(min));
	const maxVal = $derived(toNum(max) || LIMIT);

	function setMin(v: number) {
		const clamped = Math.max(0, Math.min(v, maxVal - STEP));
		min = String(clamped);
		onchange?.();
	}

	function setMax(v: number) {
		const clamped = Math.min(LIMIT, Math.max(v, minVal + STEP));
		max = String(clamped);
		onchange?.();
	}

	// RTL: 0 at right, LIMIT at left
	const left = $derived(100 - (maxVal / LIMIT) * 100);
	const right = $derived((minVal / LIMIT) * 100);
</script>

<div class="flex flex-col gap-2">
	<div class="flex items-center justify-between text-[11px] font-bold">
		<span class="tick text-[#2635D9] dark:text-[#8B93FF]">{toman(minVal || 0)}</span>
		<span class="tick text-[#2635D9] dark:text-[#8B93FF]">{toman(maxVal)}</span>
	</div>
	<div class="relative h-6" dir="rtl">
		<div class="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-[#E2E6F3] dark:bg-white/10"></div>
		<div
			class="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-l from-[#3B46F2] to-[#2635D9]"
			style="left: {left}%; right: {right}%"
		></div>
		<input
			type="range"
			dir="rtl"
			min="0"
			max={LIMIT}
			step={STEP}
			value={minVal}
			oninput={(e) => setMin(Number((e.currentTarget as HTMLInputElement).value))}
			class="pointer-events-none absolute inset-0 h-6 w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#3B46F2] [&::-webkit-slider-thumb]:shadow-[0_4px_12px_rgba(59,70,242,0.5)] dark:[&::-webkit-slider-thumb]:border-ink [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[#3B46F2] {minVal > LIMIT / 2 ? 'z-10' : ''}"
			aria-label="کف قیمت"
		/>
		<input
			type="range"
			dir="rtl"
			min="0"
			max={LIMIT}
			step={STEP}
			value={maxVal}
			oninput={(e) => setMax(Number((e.currentTarget as HTMLInputElement).value))}
			class="pointer-events-none absolute inset-0 h-6 w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#3B46F2] [&::-webkit-slider-thumb]:shadow-[0_4px_12px_rgba(59,70,242,0.5)] dark:[&::-webkit-slider-thumb]:border-ink [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[#3B46F2] {maxVal <= LIMIT / 2 ? 'z-10' : ''}"
			aria-label="سقف قیمت"
		/>
	</div>
	<div class="grid grid-cols-2 gap-2">
		<div>
			<div class="mb-1 text-[11px] font-black text-[#1B2452] dark:text-slate-200">کف (تومان)</div>
			<Input value={toGrouped(min)} oninput={onMinInput} placeholder="مثلا ۵٬۰۰۰٬۰۰۰" inputmode="numeric" class="tick rounded-xl border-[#E2E6F3] text-center focus-visible:ring-[#3B46F2] dark:border-white/15" />
		</div>
		<div>
			<div class="mb-1 text-[11px] font-black text-[#1B2452] dark:text-slate-200">سقف (تومان)</div>
			<Input value={toGrouped(max)} oninput={onMaxInput} placeholder="مثلا ۲۰٬۰۰۰٬۰۰۰" inputmode="numeric" class="tick rounded-xl border-[#E2E6F3] text-center focus-visible:ring-[#3B46F2] dark:border-white/15" />
		</div>
	</div>
</div>
