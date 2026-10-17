import { browser } from '$app/environment';

const KEY = 'arezou-recent';
const MAX = 8;

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

export const recent = {
	get ids() {
		return ids;
	},
	push(id: number) {
		ids = [id, ...ids.filter((x) => x !== id)].slice(0, MAX);
		save(ids);
	}
};
