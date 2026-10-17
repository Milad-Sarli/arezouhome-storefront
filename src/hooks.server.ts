import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Security headers
	response.headers.set('X-Frame-Options', 'SAMEORIGIN');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
	response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');

	// CSP for SvelteKit (allow inline for Svelte, images from storage and unsplash + AR model-viewer).
	// Local dev origins (127.0.0.1 / localhost, any port) are always allowed so the
	// storefront works against a local backend without CSP violations.
	const csp = [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline' https://unpkg.com",
		"style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
		"img-src 'self' data: blob: http://127.0.0.1:* http://localhost:* https://arezouhome.ir https://api.arezouhome.ir https://arezouhome.test https://dkstatics-public.digikala.com https://images.unsplash.com https://i.pravatar.cc",
		"font-src 'self' data:",
		"connect-src 'self' ws://127.0.0.1:* ws://localhost:* http://127.0.0.1:* http://localhost:* https://arezouhome.ir https://api.arezouhome.ir https://arezouhome.test https://modelviewer.dev https://unpkg.com",
		"frame-ancestors 'self'"
	].join('; ');
	response.headers.set('Content-Security-Policy', csp);

	// Cache static assets for 1 year, pages for 1 hour
	if (event.url.pathname.startsWith('/_app/') || event.url.pathname.startsWith('/images/') || event.url.pathname.startsWith('/fonts/')) {
		response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
	} else if (event.url.pathname.startsWith('/api/')) {
		response.headers.set('Cache-Control', 'no-store');
	}

	return response;
};
