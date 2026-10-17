<script lang="ts">
	let {
		title,
		subtitle = '',
		image = '/images/hero-full.webp'
	}: {
		title: string;
		subtitle?: string;
		image?: string;
	} = $props();
</script>

<section class="mx-auto max-w-7xl px-4 pt-6">
	<div class="relative flex min-h-[42vh] items-center overflow-hidden rounded-[28px] border border-[#1B2452]/10 shadow-[0_24px_70px_rgba(27,36,82,0.22)] md:min-h-[46vh] md:rounded-[32px]">
		<img src={image} alt="" aria-hidden="true" width="1600" height="600" class="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" fetchpriority="low" />
		<div class="absolute inset-0 bg-gradient-to-t from-[#111111]/85 via-[#1B2452]/45 to-[#3B46F2]/10"></div>
		<div class="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-l from-[#3B46F2] via-[#2635D9] to-transparent"></div>
		<div class="absolute -top-16 right-1/4 size-52 rounded-full bg-[#3B46F2]/40 blur-[80px]"></div>
		<div class="relative mx-auto max-w-3xl px-4 py-10 text-center md:py-14">
			<span class="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-black text-white backdrop-blur-md">آرزو هوم • ارسال سراسری</span>
			<h1 class="display mt-3 text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]" style="font-size:clamp(1.8rem,4.5vw,2.8rem);line-height:1.2">
				{@html title}
			</h1>
			{#if subtitle}
				<p class="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/80 md:text-[14px]">{subtitle}</p>
			{/if}
		</div>
	</div>
</section>
