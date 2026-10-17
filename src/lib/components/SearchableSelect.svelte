<script lang="ts">
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';

	interface Option {
		value: string;
		label: string;
	}

	let {
		options,
		value = '',
		placeholder = 'انتخاب…',
		label = '',
		disabled = false,
		onselect = undefined
	}: {
		options: Option[];
		value?: string;
		placeholder?: string;
		label?: string;
		disabled?: boolean;
		onselect?: ((v: string) => void) | undefined;
	} = $props();

	let open = $state(false);
	const selected = $derived(options.find((o) => String(o.value) === String(value)));
</script>

<div>
	{#if label}
		<div class="mb-1.5 text-xs font-black text-[#1B2452] dark:text-slate-200">{label}</div>
	{/if}
	<Popover.Root bind:open>
		<Popover.Trigger>
			{#snippet child({ props })}
				<Button
					{...props}
					variant="outline"
					role="combobox"
					aria-expanded={open}
					disabled={disabled}
					class="w-full justify-between rounded-xl border-[#E2E6F3] bg-white font-normal transition-colors hover:border-[#3B46F2]/60 hover:bg-white disabled:opacity-60 dark:border-white/15 dark:bg-white/5 dark:hover:border-[#8B93FF]/50 dark:hover:bg-white/5"
				>
					<span class={cn(!selected && 'text-slate-400 dark:text-slate-500')}>
						{selected?.label ?? placeholder}
					</span>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="shrink-0 text-[#3B46F2] dark:text-[#8B93FF]">
						<path d="m6 9 6 6 6-6" />
					</svg>
				</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content class="w-[--bits-popover-anchor-width] p-0" align="start" dir="rtl">
			<Command.Root>
				<Command.Input placeholder="جستجو…" />
				<Command.List class="thin-scroll">
					<Command.Empty>موردی پیدا نشد</Command.Empty>
					<Command.Group>
						{#each options as o (o.value)}
							<Command.Item
								value={o.label}
								onSelect={() => {
									onselect?.(o.value);
									open = false;
								}}
							>
								<span class={cn(String(o.value) === String(value) && 'font-black text-[#2635D9] dark:text-[#8B93FF]')}>
									{o.label}
								</span>
								{#if String(o.value) === String(value)}
									<span class="ms-auto font-black text-[#3B46F2]">✓</span>
								{/if}
							</Command.Item>
						{/each}
					</Command.Group>
				</Command.List>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
</div>
