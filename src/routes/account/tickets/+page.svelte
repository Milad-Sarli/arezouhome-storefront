<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Reveal from '$lib/components/Reveal.svelte';
	import FormCard from '$lib/components/FormCard.svelte';
	import { ApiError, api, type ApiList } from '$lib/api/client';
	import type { Ticket } from '$lib/api/types';
	import { toast } from 'svelte-sonner';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { MessageCircle, Plus } from 'lucide-svelte';
	import { jalali } from '$lib/format/jalali';

	let tickets = $state<Ticket[]>([]);
	let loading = $state(true);
	let subject = $state('');
	let message = $state('');
	let file = $state<File | null>(null);
	let sending = $state(false);
	let showForm = $state(false);

	async function load() {
		loading = true;
		try {
			const res = await api<ApiList<Ticket>>('/tickets');
			tickets = res.data ?? [];
		} catch (err) {
			toast.error(err instanceof ApiError ? err.message : 'خطا در بارگذاری');
		} finally {
			loading = false;
		}
	}

	onMount(load);

	async function create(e: SubmitEvent) {
		e.preventDefault();
		if (subject.trim().length < 3 || message.trim().length < 5) {
			toast.error('موضوع و پیام را کامل وارد کن');
			return;
		}
		sending = true;
		try {
			if (file) {
				const fd = new FormData();
				fd.append('subject', subject.trim());
				fd.append('message', message.trim());
				fd.append('attachment', file);
				await api('/tickets', { method: 'POST', body: fd });
			} else {
				await api('/tickets', { method: 'POST', body: JSON.stringify({ subject: subject.trim(), message: message.trim() }) });
			}
			toast.success('تیکت ثبت شد ✓');
			subject = '';
			message = '';
			file = null;
			showForm = false;
			await load();
		} catch (err) {
			toast.error(err instanceof ApiError ? err.message : 'ثبت ناموفق بود');
		} finally {
			sending = false;
		}
	}
</script>

<svelte:head>
	<title>پشتیبانی | حساب من</title>
</svelte:head>

<h1 class="display flex items-center gap-2 text-2xl md:text-3xl"><MessageCircle class="size-6 text-brand" /> پشتیبانی</h1>
<p class="mt-1 text-sm text-stone-500 dark:text-slate-400">سوالات و پیگیری‌ها — پاسخ را همینجا می‌بینی</p>

{#if !showForm}
	<Button onclick={() => (showForm = true)} class="mt-4 rounded-full bg-brand font-bold text-white hover:bg-brand">
		<Plus class="size-4" /> تیکت جدید
	</Button>
{:else}
	<FormCard title="تیکت جدید" subtitle="پیامت را بنویس، زود جواب می‌دیم" icon={MessageCircle} cls="mt-4">
		<form onsubmit={create} class="flex flex-col gap-3" dir="rtl">
			<div class="flex flex-col gap-1.5">
				<Label>موضوع</Label>
				<Input bind:value={subject} placeholder="مثلا: سوال درباره ارسال" class="rounded-xl" maxlength={255} />
			</div>
			<div class="flex flex-col gap-1.5">
				<Label>پیام</Label>
				<Textarea bind:value={message} rows={3} class="rounded-xl" maxlength={3000} />
			</div>
			<div class="flex flex-col gap-1.5">
				<Label>پیوست (اختیاری — تصویر تا ۲MB)</Label>
				<input type="file" accept="image/*" class="text-sm" onchange={(e) => (file = (e.target as HTMLInputElement).files?.[0] ?? null)} />
			</div>
			<div class="flex gap-2">
				<Button type="submit" disabled={sending} class="rounded-full bg-brand font-bold text-white hover:bg-brand">{sending ? '...' : 'ارسال'}</Button>
				<Button type="button" variant="outline" onclick={() => (showForm = false)} class="rounded-full">انصراف</Button>
			</div>
		</form>
	</FormCard>
{/if}

{#if loading}
	<div class="mt-6 flex flex-col gap-3">
		<Skeleton class="h-20 rounded-2xl" />
		<Skeleton class="h-20 rounded-2xl" />
		<Skeleton class="h-20 rounded-2xl" />
		<Skeleton class="h-20 rounded-2xl" />
	</div>
{:else if tickets.length === 0}
	<p class="mt-6 rounded-3xl border border-dashed border-stone-300 p-10 text-center text-sm text-stone-500 dark:border-white/15 dark:text-slate-400">هنوز تیکتی ثبت نکردی</p>
{:else}
	<div class="mt-4 flex flex-col gap-3">
		{#each tickets as t (t.id)}
			<Reveal>
				<a href="/account/tickets/{t.id}" class="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-4 transition-colors hover:border-brand/40 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-brand/40">
					<div>
						<p class="text-sm font-extrabold">{t.subject}</p>
						<p class="mt-1 text-xs text-stone-500 dark:text-slate-400">{jalali(t.created_at)} • {t.messages.length} پیام</p>
					</div>
					<Badge variant="secondary" class="rounded-full text-[11px]">{t.status_label}</Badge>
				</a>
			</Reveal>
		{/each}
	</div>
{/if}
