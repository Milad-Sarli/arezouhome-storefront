import { browser } from '$app/environment';
import { api } from '$lib/api/client';
import type { ProvinceWithCities } from '$lib/api/types';

const KEY = 'arezou-provinces';
const TTL = 3600_000; // 1h

export async function loadProvinces(): Promise<ProvinceWithCities[]> {
	if (browser) {
		try {
			const raw = localStorage.getItem(KEY);
			if (raw) {
				const { ts, data } = JSON.parse(raw);
				if (Date.now() - ts < TTL && Array.isArray(data)) return data as ProvinceWithCities[];
			}
		} catch {}
	}

	const data = await api<ProvinceWithCities[]>('/provinces');

	if (browser) {
		try {
			localStorage.setItem(KEY, JSON.stringify({ ts: Date.now(), data }));
		} catch {}
	}

	return data;
}
