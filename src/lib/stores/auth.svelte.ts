import { browser } from '$app/environment';
import { api } from '$lib/api/client';

export interface AuthUser {
	id: number;
	name: string;
	phone: string;
}

function loadToken(): string | null {
	if (!browser) return null;
	return localStorage.getItem('arezou-token');
}

function saveToken(token: string | null) {
	if (!browser) return;
	if (token) localStorage.setItem('arezou-token', token);
	else localStorage.removeItem('arezou-token');
}

let token = $state<string | null>(loadToken());
let user = $state<AuthUser | null>(null);

export const auth = {
	get token() {
		return token;
	},
	get user() {
		return user;
	},
	get loggedIn() {
		return token !== null;
	},
	async sendOtp(phone: string): Promise<{ debug_code?: string }> {
		return await api<{ message: string; debug_code?: string }>('/auth/otp/send', {
			method: 'POST',
			body: JSON.stringify({ phone })
		});
	},
	async verifyOtp(phone: string, code: string): Promise<AuthUser> {
		const res = await api<{ token: string; user: AuthUser }>('/auth/otp/verify', {
			method: 'POST',
			body: JSON.stringify({ phone, code })
		});
		token = res.token;
		user = res.user;
		saveToken(token);
		return res.user;
	},
	async loginPassword(phone: string, password: string): Promise<AuthUser> {
		const res = await api<{ token: string; user: AuthUser }>('/auth/login', {
			method: 'POST',
			body: JSON.stringify({ phone, password })
		});
		token = res.token;
		user = res.user;
		saveToken(token);
		return res.user;
	},
	async register(name: string, phone: string, password: string, password_confirmation: string): Promise<AuthUser> {
		const res = await api<{ token: string; user: AuthUser }>('/auth/register', {
			method: 'POST',
			body: JSON.stringify({ name, phone, password, password_confirmation })
		});
		token = res.token;
		user = res.user;
		saveToken(token);
		return res.user;
	},
	async me(): Promise<void> {
		if (!token) return;
		try {
			user = await api<AuthUser>('/me');
		} catch {
			this.logout();
		}
	},
	async updateName(name: string): Promise<void> {
		const res = await api<AuthUser>('/me', {
			method: 'PATCH',
			body: JSON.stringify({ name })
		});
		user = res;
	},
	async setPassword(password: string, password_confirmation: string): Promise<void> {
		await api<{ message: string }>('/me/password', {
			method: 'POST',
			body: JSON.stringify({ password, password_confirmation })
		});
	},
	async logout(remote = true): Promise<void> {
		if (remote && token) {
			try {
				await api('/logout', { method: 'POST' });
			} catch {
				/* token may already be invalid */
			}
		}
		token = null;
		user = null;
		saveToken(null);
	}
};
