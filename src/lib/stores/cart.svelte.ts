import { browser } from '$app/environment';
import { api } from '$lib/api/client';
import { auth } from './auth.svelte';

export interface CartItem {
	key: string;
	productId: number;
	variantId: number | null;
	name: string;
	color: string | null;
	price: number;
	wasPrice: number | null;
	qty: number;
	image: string | null;
}

function load(): CartItem[] {
	if (!browser) return [];
	try {
		return JSON.parse(localStorage.getItem('arezou-cart') ?? '[]');
	} catch {
		return [];
	}
}

function save(items: CartItem[]) {
	if (browser) localStorage.setItem('arezou-cart', JSON.stringify(items));
}

let syncTimer: ReturnType<typeof setTimeout> | null = null;

function syncToCloud() {
	if (!browser || !auth.loggedIn || items.length === 0) return;
	if (syncTimer) clearTimeout(syncTimer);
	syncTimer = setTimeout(() => {
		api('/cart/sync', {
			method: 'POST',
			body: JSON.stringify({
				items: items.map((i) => ({ product_id: i.productId, quantity: i.qty }))
			})
		}).catch(() => {});
	}, 800);
}

function clearCloud() {
	if (!browser || !auth.loggedIn) return;
	api('/cart', { method: 'DELETE' }).catch(() => {});
}

async function syncFromCloud(): Promise<void> {
	if (!browser || !auth.loggedIn) return;
	try {
		const res = await api<{ items: { product_id: number; quantity: number }[] }>('/cart');
		const cloud = res.items ?? [];
		if (cloud.length === 0) return;
		// Merge cloud into local (cloud wins for qty if conflict, local extra kept)
		const map = new Map<string, CartItem>();
		for (const i of items) map.set(i.key, i);
		for (const c of cloud) {
			const key = `${c.product_id}:0`;
			const existing = map.get(key);
			if (existing) {
				existing.qty = Math.max(existing.qty, c.quantity);
			} else {
				// placeholder item; name/price will be hydrated on cart page via products?ids fetch
				map.set(key, {
					key,
					productId: c.product_id,
					variantId: null,
					name: `محصول #${c.product_id}`,
					color: null,
					price: 0,
					wasPrice: null,
					qty: c.quantity,
					image: null
				});
			}
		}
		items = [...map.values()];
		save(items);
	} catch {
		/* offline */
	}
}

let items = $state<CartItem[]>(load());

export const cart = {
	get items() {
		return items;
	},
	get count() {
		return items.reduce((n, i) => n + i.qty, 0);
	},
	get total() {
		return items.reduce((n, i) => n + i.qty * i.price, 0);
	},
	add(item: Omit<CartItem, 'key' | 'qty'>, qty = 1) {
		const key = `${item.productId}:${item.variantId ?? 0}`;
		const found = items.find((i) => i.key === key);
		if (found) {
			found.qty += qty;
		} else {
			items.push({ ...item, key, qty });
		}
		items = [...items];
		save(items);
		syncToCloud();
	},
	setQty(key: string, qty: number) {
		if (qty <= 0) {
			items = items.filter((i) => i.key !== key);
		} else {
			const found = items.find((i) => i.key === key);
			if (found) found.qty = qty;
			items = [...items];
		}
		save(items);
		if (items.length === 0) clearCloud();
		else syncToCloud();
	},
	clear() {
		items = [];
		save(items);
		clearCloud();
	},
	syncFromCloud
};
