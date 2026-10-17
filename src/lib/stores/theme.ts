import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark';

function initial(): Theme {
	if (!browser) return 'light';
	const saved = localStorage.getItem('arezou-theme');
	return saved === 'dark' ? 'dark' : 'light';
}

export const theme = writable<Theme>(initial());

export function applyTheme(t: Theme) {
	if (!browser) return;
	document.documentElement.classList.toggle('dark', t === 'dark');
	document.documentElement.style.colorScheme = t;
	localStorage.setItem('arezou-theme', t);
	theme.set(t);
}

if (browser) {
	applyTheme(initial());
}
