import { PUBLIC_API_URL } from '$env/static/public';
import { browser } from '$app/environment';

export class ApiError extends Error {
	status: number;

	constructor(status: number, message: string) {
		super(message);
		this.status = status;
	}
}

export function authToken(): string | null {
	if (!browser) return null;
	return localStorage.getItem('arezou-token');
}

export async function api<T>(path: string, init?: RequestInit, fetchFn: typeof fetch = fetch): Promise<T> {
	const headers: Record<string, string> = { Accept: 'application/json', ...(init?.headers as Record<string, string> ?? {}) };
	const token = authToken();
	if (token) headers['Authorization'] = `Bearer ${token}`;
	if (init?.body !== undefined && !(init.body instanceof FormData) && !headers['Content-Type']) {
		headers['Content-Type'] = 'application/json';
	}

	const res = await fetchFn(`${PUBLIC_API_URL}${path}`, { ...init, headers });

	if (!res.ok) {
		let message = `خطا (${faStatus(res.status)})`;
		try {
			const body = await res.json();
			if (typeof body?.message === 'string' && body.message) message = body.message;
		} catch {
			/* keep default */
		}
		throw new ApiError(res.status, message);
	}

	return (await res.json()) as T;
}

function faStatus(status: number): string {
	return status.toLocaleString('fa-IR');
}

export interface ApiList<T> {
	data: T[];
}
