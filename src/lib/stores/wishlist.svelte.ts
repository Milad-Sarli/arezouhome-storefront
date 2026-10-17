import { browser } from '$app/environment';
import { api } from '$lib/api/client';
import { auth } from './auth.svelte';

const KEY = 'arezou-wishlist';

function load(): number[] {
	if (!browser) return [];
	try {
		const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]');
		return Array.isArray(raw) ? raw.filter((n) => typeof n === 'number') : [];
	} catch {
		return [];
	}
}

function save(ids: number[]) {
	if (browser) localStorage.setItem(KEY, JSON.stringify(ids));
}

let ids = $state<number[]>(load());

async function syncFromCloud(): Promise<void> {
	if (!auth.loggedIn) return;
	try {
		const res = await api<{ ids: number[] }>('/wishlist');
		const cloud = res.ids ?? [];
		const merged = [...new Set([...ids, ...cloud])];
		if (merged.length !== cloud.length) {
			await api('/wishlist/sync', { method: 'POST', body: JSON.stringify({ ids: merged }) });
		}
		ids = merged;
		save(ids);
	} catch {
		/* offline or guest */
	}
}

export const wishlist = {
	get ids() {
		return ids;
	},
	get count() {
		return ids.length;
	},
	has(id: number): boolean {
		return ids.includes(id);
	},
	async toggle(id: number): Promise<boolean> {
		if (!auth.loggedIn) {
			const added = !ids.includes(id);
			ids = added ? [...ids, id] : ids.filter((x) => x !== id);
			save(ids);
			return added;
		}
		try {
			const res = await api<{ added: boolean }>('/wishlist/toggle', {
				method: 'POST',
				body: JSON.stringify({ product_id: id })
			});
			if (res.added) {
				if (!ids.includes(id)) ids = [...ids, id];
			} else {
				ids = ids.filter((x) => x !== id);
			}
			save(ids);
			return res.added;
		} catch {
			// fallback to local
			const added = !ids.includes(id);
			ids = added ? [...ids, id] : ids.filter((x) => x !== id);
			save(ids);
			return added;
		}
	},
	syncFromCloud,
	// called after login/logout
	async onAuthChange(): Promise<void> {
		if (auth.loggedIn) await syncFromCloud();
	}
};
