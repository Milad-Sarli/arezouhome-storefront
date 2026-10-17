<script lang="ts">
	import { fileUrl } from '$lib/api/files';
	import type { BlogPost } from '$lib/api/types';
	import SmartImage from './SmartImage.svelte';
	import { jalali } from '$lib/format/jalali';
	import { FALLBACK_VECTOR } from '$lib/constants';
	import Reveal from './Reveal.svelte';
	import { Clock, ArrowLeft } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';

	let { post, delay = 0 }: { post: BlogPost; delay?: number } = $props();

	function excerpt(html: string | null): string {
		if (!html) return '';
		const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
		return text.length > 90 ? text.slice(0, 88) + '…' : text;
	}

	const summary = $derived(post.excerpt || excerpt(post.description));
	const readTime = $derived((post.reading_minutes ?? Math.max(2, Math.ceil(excerpt(post.description).length / 180))) + ' دقیقه');
</script>

<Reveal delay={(delay % 3) * 70} class="h-full">
	<a href="/blog/{post.slug}" class="group block h-full">
		<Card.Root class="card-brand h-full">
			<div class="relative aspect-[16/10] overflow-hidden bg-[#F7F8FC] dark:bg-white/[0.03]">
				{#if fileUrl(post.image)}
					<SmartImage
						src={post.image}
						alt={post.title}
						widths={[320, 640, 960]}
						sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
						width={640}
						height={400}
						imgClass="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
					/>
				{:else}
					<div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#3B46F2]/15 via-[#2635D9]/10 to-[#F7F8FC] dark:from-[#3B46F2]/25 dark:via-white/[0.04] dark:to-transparent">
						<img src={FALLBACK_VECTOR} alt="" loading="lazy" class="w-20 text-[#3B46F2]/60 sm:w-24" />
					</div>
				{/if}
				<div class="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent"></div>
				{#if post.category}
					<Badge variant="secondary" class="absolute top-3 right-3 z-10 border-white/20 bg-white/90 font-black text-stone-900 backdrop-blur-md dark:bg-white/10 dark:text-white">
						{post.category}
					</Badge>
				{/if}
				<Badge class="absolute bottom-3 right-3 z-10 gap-1.5 border-0 bg-black/55 font-bold text-white backdrop-blur-md hover:bg-black/55">
					<Clock class="size-3" />
					{readTime}
				</Badge>
			</div>

			<Card.Header class="gap-2 p-4 sm:p-5">
				<Card.Title class="line-clamp-2 text-[15px] leading-7 text-[#1B2452] transition-colors group-hover:text-[#2635D9] sm:text-[16px] dark:text-white dark:group-hover:text-[#8B93FF]">
					{post.title}
				</Card.Title>
				{#if summary}
					<Card.Description class="line-clamp-2 text-[13px] leading-6">
						{summary}
					</Card.Description>
				{/if}
			</Card.Header>

			<Card.Footer class="mt-auto items-center justify-between p-4 pt-0 sm:px-5">
				<Separator class="mb-3" />
				<span class="flex w-full items-center justify-between gap-2">
					<span class="flex items-center gap-1.5 text-[11px] font-bold text-stone-400 dark:text-slate-500">
						<span class="size-1.5 rounded-full bg-brand"></span>
						{jalali(post.publish_at)}
					</span>
					<span class="flex items-center gap-1 text-xs font-black text-[#2635D9] transition-transform group-hover:-translate-x-1 dark:text-[#8B93FF]">
						ادامه مطلب <ArrowLeft class="size-3.5" />
					</span>
				</span>
			</Card.Footer>
		</Card.Root>
	</a>
</Reveal>
