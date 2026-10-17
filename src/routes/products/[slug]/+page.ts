import { error } from '@sveltejs/kit';
import { api } from '$lib/api/client';
import type { Product } from '$lib/api/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	try {
		const res = await api<{ data: Product }>(`/products/${params.slug}`, undefined, fetch);
		return { product: res.data };
	} catch {
		error(404, 'کالا پیدا نشد');
	}
};
