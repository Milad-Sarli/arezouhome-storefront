<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onDestroy } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { ApiError, api } from '$lib/api/client';
	import { auth } from '$lib/stores/auth.svelte';
	import { wishlist } from '$lib/stores/wishlist.svelte';
	import { cart } from '$lib/stores/cart.svelte';
	import { faDigits } from '$lib/format/money';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import FormCard from '$lib/components/FormCard.svelte';
	import { toast } from 'svelte-sonner';

	const next = $derived((page.url.searchParams.get('next') ?? '/') as string);

	type Method = 'password' | 'otp';
	let method = $state<Method>('password');
	let isSignup = $state(false);

	// password form
	let name = $state('');
	let phone = $state('');
	let password = $state('');
	let confirm = $state('');

	// otp form
	let step = $state<'phone' | 'code'>('phone');
	let code = $state('');
	let cooldown = $state(0);
	let timer: ReturnType<typeof setInterval> | null = null;

	let busy = $state(false);
	let error = $state<string | null>(null);

	onDestroy(() => {
		if (timer) clearInterval(timer);
	});

	function startCooldown() {
		cooldown = 60;
		localStorage.setItem('arezou-otp-until', String(Date.now() + 60_000));
		if (timer) clearInterval(timer);
		timer = setInterval(() => {
			cooldown -= 1;
			if (cooldown <= 0 && timer) clearInterval(timer);
		}, 1000);
	}

	$effect(() => {
		const until = Number(localStorage.getItem('arezou-otp-until') ?? 0);
		if (until > Date.now()) {
			cooldown = Math.ceil((until - Date.now()) / 1000);
			if (timer) clearInterval(timer);
			timer = setInterval(() => {
				cooldown -= 1;
				if (cooldown <= 0 && timer) clearInterval(timer);
			}, 1000);
		}
	});

	function validPhone(v: string): boolean {
		return /^09\d{9}$/.test(v.trim());
	}

	function switchMethod(m: Method) {
		method = m;
		error = null;
		if (m === 'otp' && cooldown > 0 && step === 'code') return;
		step = 'phone';
	}

	async function afterLogin() {
		try {
			await Promise.all([wishlist.syncFromCloud(), cart.syncFromCloud()]);
			const needsHydrate = cart.items.filter((i) => i.price === 0).map((i) => i.productId);
			if (needsHydrate.length > 0) {
				try {
					const res = await api<{ data: { id: number; name: string; final_price_rial: number; price_rial: number; image: string | null }[] }>(`/products?ids=${needsHydrate.join(',')}`);
					for (const p of res.data ?? []) {
						const key = `${p.id}:0`;
						const found = cart.items.find((x) => x.key === key);
						if (found) {
							found.name = p.name;
							found.price = p.final_price_rial;
							found.image = p.image;
						}
					}
				} catch {
					/* ignore hydrate */
				}
			}
			if (cart.items.length > 0) {
				await api('/cart/sync', {
					method: 'POST',
					body: JSON.stringify({ items: cart.items.map((i) => ({ product_id: i.productId, quantity: i.qty })) })
				});
			}
		} catch {
			/* ignore */
		}
		toast.success('خوش اومدی! 🎉');
		await goto(next);
	}

	async function submitPassword() {
		error = null;
		if (isSignup && name.trim().length < 2) {
			error = 'نامت را وارد کن';
			return;
		}
		if (!validPhone(phone)) {
			error = 'شماره موبایل رو درست وارد کن (مثل 09121234567)';
			return;
		}
		if (password.length < 6) {
			error = 'رمز عبور حداقل ۶ نویسه باشد';
			return;
		}
		if (isSignup && password !== confirm) {
			error = 'تکرار رمز با رمز یکی نیست';
			return;
		}
		busy = true;
		try {
			if (isSignup) {
				await auth.register(name.trim(), phone.trim(), password, confirm);
				toast.success('حسابت ساخته شد 🎉');
			} else {
				await auth.loginPassword(phone.trim(), password);
			}
			await afterLogin();
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'ناموفق بود. دوباره تلاش کن.';
		} finally {
			busy = false;
		}
	}

	async function send(e?: SubmitEvent) {
		e?.preventDefault();
		error = null;
		if (!validPhone(phone)) {
			error = 'شماره موبایل رو درست وارد کن (مثل 09121234567)';
			return;
		}
		busy = true;
		try {
			const res = await auth.sendOtp(phone.trim());
			step = 'code';
			startCooldown();
			if (res.debug_code) {
				code = res.debug_code;
				toast.info('حالت توسعه: کد خودکار وارد شد 🤖');
			} else {
				toast.success('کد تأیید پیامک شد 📱');
			}
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'ارسال کد ناموفق بود. دوباره تلاش کن.';
		} finally {
			busy = false;
		}
	}

	async function verify() {
		error = null;
		if (code.trim().length < 4) {
			error = 'کد تأیید رو کامل وارد کن';
			return;
		}
		busy = true;
		try {
			await auth.verifyOtp(phone.trim(), code.trim());
			await afterLogin();
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'تأیید ناموفق بود. دوباره تلاش کن.';
		} finally {
			busy = false;
		}
	}
</script>

<SeoHead title="ورود" description="ورود یا ثبت‌نام در فروشگاه آرزو — با رمز عبور یا کد پیامک" noindex />

<div class="grid min-h-svh lg:grid-cols-2" dir="rtl">
	<div class="flex flex-col gap-4 p-6 md:p-10">
		<div class="flex justify-center gap-2 md:justify-start">
			<a href="/" class="display flex items-center gap-2 text-2xl font-bold">
				آرزو<span class="text-brand">.</span>
			</a>
		</div>
		<div class="flex flex-1 items-center justify-center py-8">
			<div class="w-full max-w-sm">
				<FormCard>
					<form class="flex flex-col gap-6" onsubmit={(e) => e.preventDefault()}>
					<div class="flex flex-col items-center gap-1 text-center">
						<h1 class="display text-2xl font-bold">{isSignup && method === 'password' ? 'ساخت حساب' : 'ورود به حساب'}</h1>
						<p class="text-sm text-balance text-stone-500 dark:text-slate-400">
							{method === 'password'
								? isSignup
									? 'نام، موبایل و رمزت را وارد کن'
									: 'موبایل و رمزت را وارد کن'
								: step === 'phone'
									? 'شماره موبایلت را وارد کن تا کد پیامک شود'
									: 'کد پیامک‌شده را وارد کن'}
						</p>
					</div>

					<div class="grid grid-cols-2 gap-1 rounded-full border border-stone-200 bg-stone-100 p-1 dark:border-white/10 dark:bg-white/5" role="tablist" aria-label="روش ورود">
						<button
							type="button"
							role="tab"
							aria-selected={method === 'password'}
							onclick={() => switchMethod('password')}
							class="rounded-full px-3 py-1.5 text-sm font-bold transition-all {method === 'password'
								? 'bg-white text-stone-900 shadow-sm dark:bg-white/10 dark:text-white'
								: 'text-stone-500 hover:text-stone-700 dark:text-slate-400'}"
						>
							رمز عبور
						</button>
						<button
							type="button"
							role="tab"
							aria-selected={method === 'otp'}
							onclick={() => switchMethod('otp')}
							class="rounded-full px-3 py-1.5 text-sm font-bold transition-all {method === 'otp'
								? 'bg-white text-stone-900 shadow-sm dark:bg-white/10 dark:text-white'
								: 'text-stone-500 hover:text-stone-700 dark:text-slate-400'}"
						>
							کد پیامک
						</button>
					</div>

					{#if method === 'password'}
						<div class="flex flex-col gap-3">
							{#if isSignup}
								<div class="flex flex-col gap-1.5">
									<Label for="pw-name">نام</Label>
									<Input id="pw-name" bind:value={name} placeholder="مثلاً علی رضایی" autocomplete="name" class="rounded-xl" />
								</div>
							{/if}
							<div class="flex flex-col gap-1.5">
								<Label for="pw-phone">شماره موبایل</Label>
								<Input
									id="pw-phone"
									bind:value={phone}
									inputmode="tel"
									placeholder="09121234567"
									autocomplete="username"
									class="tick rounded-xl text-center text-lg tracking-widest"
								/>
							</div>
							<div class="flex flex-col gap-1.5">
								<div class="flex items-center">
									<Label for="pw-pass">رمز عبور</Label>
									{#if !isSignup}
										<button type="button" onclick={() => switchMethod('otp')} class="ms-auto text-xs text-stone-500 underline-offset-4 hover:underline dark:text-slate-400">
											رمز را فراموش کردی؟
										</button>
									{/if}
								</div>
								<Input
									id="pw-pass"
									type="password"
									bind:value={password}
									placeholder="حداقل ۶ نویسه"
									autocomplete={isSignup ? 'new-password' : 'current-password'}
									class="rounded-xl text-center tracking-widest"
								/>
							</div>
							{#if isSignup}
								<div class="flex flex-col gap-1.5">
									<Label for="pw-confirm">تکرار رمز عبور</Label>
									<Input
										id="pw-confirm"
										type="password"
										bind:value={confirm}
										placeholder="رمز را دوباره بزن"
										autocomplete="new-password"
										class="rounded-xl text-center tracking-widest"
									/>
								</div>
							{/if}
							{#if error}
								<p class="text-center text-sm font-bold text-red-600">{error}</p>
							{/if}
							<Button onclick={submitPassword} disabled={busy} class="w-full rounded-full bg-brand font-extrabold text-white hover:bg-brand">
								{busy ? '...' : isSignup ? 'ساخت حساب' : 'ورود'}
							</Button>
							<p class="text-center text-sm text-stone-500 dark:text-slate-400">
								{isSignup ? 'حساب داری؟' : 'حساب نداری؟'}
								<button
									type="button"
									onclick={() => {
										isSignup = !isSignup;
										error = null;
									}}
									class="font-bold text-brand-dark underline underline-offset-4 dark:text-brand"
								>
									{isSignup ? 'وارد شو' : 'ثبت‌نام کن'}
								</button>
							</p>
						</div>
					{:else if step === 'phone'}
						<div class="flex flex-col gap-3">
							<div class="flex flex-col gap-1.5">
								<Label for="phone">شماره موبایل</Label>
								<Input
									id="phone"
									bind:value={phone}
									inputmode="tel"
									placeholder="09121234567"
									class="tick rounded-xl text-center text-lg tracking-widest"
									autofocus
								/>
							</div>
							{#if error}
								<p class="text-center text-sm font-bold text-red-600">{error}</p>
							{/if}
							<Button onclick={() => send()} disabled={busy} class="w-full rounded-full bg-brand font-extrabold text-white hover:bg-brand">
								{busy ? '...' : 'ارسال کد تأیید'}
							</Button>
						</div>
					{:else}
						<div class="flex flex-col gap-3">
							<div class="flex flex-col gap-1.5">
								<Label for="code">کد تأیید</Label>
								<Input
									id="code"
									bind:value={code}
									inputmode="numeric"
									maxlength={5}
									placeholder="•••••"
									class="tick rounded-xl text-center text-2xl tracking-[0.5em]"
									autofocus
								/>
							</div>
							{#if error}
								<p class="text-center text-sm font-bold text-red-600">{error}</p>
							{/if}
							<Button onclick={verify} disabled={busy} class="w-full rounded-full bg-brand font-extrabold text-white hover:bg-brand">
								{busy ? '...' : 'ورود'}
							</Button>
							<div class="flex items-center justify-between text-xs text-stone-500 dark:text-slate-400">
								<button type="button" class="underline underline-offset-4" onclick={() => (step = 'phone')}>
									تغییر شماره
								</button>
								{#if cooldown > 0}
									<span class="tick">ارسال مجدد تا {faDigits(cooldown)} ثانیه</span>
								{:else}
									<button type="button" class="underline underline-offset-4" onclick={() => send()}>
										ارسال مجدد کد
									</button>
								{/if}
							</div>
						</div>
					{/if}
				</form>
				</FormCard>
			</div>
		</div>
	</div>
	<div class="relative hidden overflow-hidden bg-stone-100 lg:block dark:bg-white/5">
		<video
			class="absolute inset-0 h-full w-full object-cover"
			src="/videos/login-welcome.mp4"
			poster="/videos/login-welcome-poster.jpg"
			autoplay
			muted
			loop
			playsinline
			preload="metadata"
			disablepictureinpicture
			aria-hidden="true"
		></video>
		<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
		<div class="absolute inset-x-0 bottom-0 p-10 text-white">
			<p class="display text-2xl font-bold drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">به آرزو خوش اومدی</p>
			<p class="mt-1 text-sm text-white/80">لوازم خونت، با گارانتی شرکتی و قیمت شفاف</p>
		</div>
	</div>
</div>
