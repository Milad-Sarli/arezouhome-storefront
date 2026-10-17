import { api } from '$lib/api/client';
import type { Brand, Category, Paginated, Product } from '$lib/api/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
	const params = new URLSearchParams();
	for (const key of ['category_id', 'brand_id', 'search', 'min_price', 'max_price', 'sort', 'page']) {
		const v = url.searchParams.get(key);
		if (v) params.set(key, v);
	}
	if (url.searchParams.get('in_stock') === '1') params.set('in_stock', '1');

	const [result, brands, categories] = await Promise.all([
		api<Paginated<Product>>(`/products?${params}`, undefined, fetch).catch(() => ({
			data: [],
			meta: { current_page: 1, last_page: 1, total: 0 }
		})),
		api<Brand[]>('/brands', undefined, fetch).catch(() => []),
		api<{ data: Category[] }>('/categories', undefined, fetch).catch(() => ({ data: [] }))
	]);

	return { result, brands, categories: categories.data ?? [], query: Object.fromEntries(url.searchParams) };
};
