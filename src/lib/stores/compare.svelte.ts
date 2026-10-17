import { browser } from '$app/environment';

const KEY = 'arezou-compare';
const MAX = 4;

function load(): number[] {
	if (!browser) return [];
	try {
		const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]');
		return Array.isArray(raw) ? raw.filter((n) => typeof n === 'number').slice(0, MAX) : [];
	} catch {
		return [];
	}
}

function save(ids: number[]) {
	if (browser) localStorage.setItem(KEY, JSON.stringify(ids));
}

let ids = $state<number[]>(load());

export const compare = {
	get ids() {
		return ids;
	},
	get count() {
		return ids.length;
	},
	has(id: number): boolean {
		return ids.includes(id);
	},
	toggle(id: number): boolean {
		if (ids.includes(id)) {
			ids = ids.filter((x) => x !== id);
			save(ids);
			return false;
		}
		if (ids.length >= MAX) return false;
		ids = [...ids, id];
		save(ids);
		return true;
	},
	clear() {
		ids = [];
		save(ids);
	}
};
