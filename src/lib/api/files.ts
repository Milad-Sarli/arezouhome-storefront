import { PUBLIC_API_URL, PUBLIC_FILES_URL } from '$env/static/public';
import type { ImageVariant } from './types';

/** Storage path (categories/x.webp) -> absolute URL. Pass-through for full URLs. */
export function fileUrl(path: string | null | undefined): string | null {
	if (!path) return null;
	if (path.startsWith('http') || path.startsWith('/')) return path;
	return `${PUBLIC_FILES_URL}/${path}`;
}

/** App origin derived from API URL, e.g. http://arezouhome.test */
export function appBase(): string {
	return PUBLIC_API_URL.replace(/\/api\/v1\/?$/, '');
}

export const IMAGE_WIDTHS = [320, 640, 960, 1280] as const;

/** True when the path lives in Laravel storage (so /img/{w} variants exist). */
export function isStoragePath(path: string | null | undefined): boolean {
	if (!path) return false;
	return !path.startsWith('http') && !path.startsWith('/');
}

/** Absolute URL of a resized variant (pre-generated static file). Falls back to fileUrl for static/absolute paths. */
export function variantUrl(path: string | null | undefined, w: number): string | null {
	if (!path) return null;
	if (!isStoragePath(path)) return fileUrl(path);
	return `${PUBLIC_FILES_URL}/cache/${w}/${path}`;
}

/** srcset string for a storage image (static pre-generated variants). Returns null for static/absolute images. */
export function srcSet(
	path: string | null | undefined,
	widths: readonly number[] = IMAGE_WIDTHS
): string | null {
	if (!isStoragePath(path)) return null;
	return widths.map((w) => `${PUBLIC_FILES_URL}/cache/${w}/${path} ${w}w`).join(', ');
}

/** srcset from API-provided image_variants (preferred, exact URLs). */
export function srcSetFromVariants(
	variants: ImageVariant[] | null | undefined,
	path: string | null | undefined,
	widths: readonly number[] = IMAGE_WIDTHS
): string | null {
	if (variants && variants.length > 0) {
		return [...variants]
			.sort((a, b) => a.width - b.width)
			.map((v) => `${v.url} ${v.width}w`)
			.join(', ');
	}
	return srcSet(path, widths);
}

/** Sensible default src (640w variant) for storage images. */
export function defaultSrc(
	path: string | null | undefined,
	variants?: ImageVariant[] | null
): string | null {
	if (!path) return null;
	if (variants && variants.length > 0) {
		const sorted = [...variants].sort((a, b) => a.width - b.width);
		const mid = sorted.find((v) => v.width >= 640) ?? sorted[sorted.length - 1];
		return mid.url;
	}
	return variantUrl(path, 640) ?? fileUrl(path);
}
