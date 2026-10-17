<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Reveal from '$lib/components/Reveal.svelte';
	import FormCard from '$lib/components/FormCard.svelte';
	import { MessageCircle } from 'lucide-svelte';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { ApiError, api } from '$lib/api/client';
	import type { Ticket } from '$lib/api/types';
	import { toast } from 'svelte-sonner';
	import { jalali } from '$lib/format/jalali';

	const id = $derived(page.params.id);
	let ticket = $state<Ticket | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let reply = $state('');
	let file = $state<File | null>(null);
	let sending = $state(false);

	async function load() {
		loading = true;
		error = null;
		try {
			ticket = await api<Ticket>(`/tickets/${id}`);
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'تیکت پیدا نشد';
		} finally {
			loading = false;
		}
	}

	onMount(load);

	async function send(e: SubmitEvent) {
		e.preventDefault();
		if (reply.trim().length < 3) {
			toast.error('پیام کوتاهه');
			return;
		}
		sending = true;
		try {
			if (file) {
				const fd = new FormData();
				fd.append('message', reply.trim());
				fd.append('attachment', file);
				ticket = await api<Ticket>(`/tickets/${id}/reply`, { method: 'POST', body: fd });
			} else {
				ticket = await api<Ticket>(`/tickets/${id}/reply`, { method: 'POST', body: JSON.stringify({ message: reply.trim() }) });
			}
			reply = '';
			file = null;
			toast.success('پیام ارسال شد ✓');
		} catch (err) {
			toast.error(err instanceof ApiError ? err.message : 'ارسال ناموفق');
		} finally {
			sending = false;
		}
	}
</script>

<svelte:head>
	<title>تیکت {id} | حساب من</title>
</svelte:head>

{#if loading}
	<div class="flex flex-col gap-3">
		<Skeleton class="h-10 w-1/3 rounded-2xl" />
		<Skeleton class="h-32 rounded-2xl" />
		<Skeleton class="h-32 rounded-2xl" />
		<Skeleton class="h-40 rounded-2xl" />
	</div>
{:else if error || !ticket}
	<p class="text-sm font-bold text-red-600">{error ?? 'تیکت پیدا نشد'}</p>
{:else}
	<div class="flex items-center justify-between gap-2">
		<div>
			<a href="/account/tickets" class="text-xs font-bold text-brand-dark hover:underline dark:text-brand">→ بازگشت</a>
			<h1 class="display mt-1 text-xl">{ticket.subject}</h1>
		</div>
		<Badge variant="secondary" class="rounded-full">{ticket.status_label}</Badge>
	</div>

	<div class="mt-4 flex flex-col gap-3">
		{#each ticket.messages as m (m.id)}
			<Reveal>
				<Card.Root class="rounded-2xl {m.is_mine ? 'border-brand/20 bg-brand/[0.04] dark:border-brand/20' : ''}">
					<Card.Content class="p-4">
						<div class="flex items-center justify-between gap-2">
							<span class="text-xs font-extrabold">{m.user_name}</span>
							<span class="text-[11px] text-stone-500 dark:text-slate-400">{jalali(m.created_at)}</span>
						</div>
						<p class="mt-2 text-sm leading-7 text-stone-700 dark:text-slate-200">{m.message}</p>
						{#if m.attachment}
							<a href={m.attachment} target="_blank" class="mt-2 inline-block overflow-hidden rounded-xl border">
								<img src={m.attachment} alt="پیوست" width="200" loading="lazy" decoding="async" class="max-h-40 object-contain" />
							</a>
						{/if}
					</Card.Content>
				</Card.Root>
			</Reveal>
		{/each}
	</div>

	{#if ticket.status !== 'closed'}
		<FormCard title="ارسال پاسخ" icon={MessageCircle} cls="mt-4">
			<form onsubmit={send} class="flex flex-col gap-2" dir="rtl">
				<Textarea bind:value={reply} rows={3} maxlength={3000} placeholder="پاسخ..." class="rounded-xl" />
				<input type="file" accept="image/*" class="text-sm" onchange={(e) => (file = (e.target as HTMLInputElement).files?.[0] ?? null)} />
				<Button type="submit" disabled={sending} class="w-fit rounded-full bg-brand font-bold text-white hover:bg-brand">{sending ? '...' : 'ارسال پاسخ'}</Button>
			</form>
		</FormCard>
	{:else}
		<p class="mt-4 rounded-2xl bg-stone-100 p-4 text-center text-sm text-stone-500 dark:bg-white/5 dark:text-slate-400">این تیکت بسته شده است</p>
	{/if}
{/if}
