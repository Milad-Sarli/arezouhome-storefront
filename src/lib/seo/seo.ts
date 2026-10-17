import { page } from '$app/state';
import { fileUrl } from '$lib/api/files';

export interface SeoProps {
	title: string;
	description: string;
	image?: string | null;
	type?: 'website' | 'product' | 'article';
	noindex?: boolean;
	jsonLd?: Record<string, unknown>[];
}

const SITE_NAME = 'فروشگاه آرزو';
const DEFAULT_DESC =
	'خرید یخچال، لباسشویی، ظرفشویی، سشوار، قابلمه و سرویس غذاخوری با گارانتی شرکتی و ارسال به سراسر کشور';

export function seoHead(p: SeoProps) {
	const url = page.url;
	const canonical = `${url.origin}${url.pathname}`;
	const image = p.image ? (fileUrl(p.image) ?? p.image) : `${url.origin}/images/hero-real-1.webp`;

	return {
		title: `${p.title} | ${SITE_NAME}`,
		description: p.description || DEFAULT_DESC,
		canonical,
		image,
		type: p.type ?? 'website',
		noindex: p.noindex ?? false,
		jsonLd: p.jsonLd ?? []
	};
}

export function orgJsonLd(origin: string): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'Store',
		'@id': `${origin}/#store`,
		name: 'فروشگاه آرزو',
		url: origin,
		description: DEFAULT_DESC,
		inLanguage: 'fa-IR'
	};
}

export function websiteJsonLd(origin: string): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'@id': `${origin}/#website`,
		url: origin,
		name: 'فروشگاه آرزو',
		inLanguage: 'fa-IR',
		potentialAction: {
			'@type': 'SearchAction',
			target: `${origin}/products?search={query}`,
			'query-input': 'required name=query'
		}
	};
}

export function breadcrumbJsonLd(origin: string, trail: { name: string; path: string }[]): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: trail.map((t, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: t.name,
			item: `${origin}${t.path}`
		}))
	};
}

export function stripHtml(html: string | null | undefined, max = 160): string {
	if (!html) return DEFAULT_DESC;
	const text = html
		.replace(/<[^>]*>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	return text.length > max ? text.slice(0, max - 1) + '…' : text || DEFAULT_DESC;
}
