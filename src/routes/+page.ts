import { api } from '$lib/api/client';
import type { Amazing, BlogPost, Product } from '$lib/api/types';
import type { PageLoad } from './$types';

interface Category {
	id: number;
	title: string;
	slug: string;
	image: string | null;
	children?: Category[];
}

interface Brand {
	id: number;
	name: string;
	slug: string;
	logo: string | null;
}

interface Slider {
	slides: { image: string | null; title: string | null; description: string | null; link: string | null; button_title: string | null; button_link: string | null }[];
}

interface HomePayload {
	categories: { data: Category[] };
	brands: Brand[];
	settings: Record<string, string>;
	amazings: Amazing[];
	products: { data: Product[] };
	sliders: Slider[];
	blogs: BlogPost[];
}

export const load: PageLoad = async ({ fetch }) => {
	const fallback = {
		categories: { data: [] as Category[] },
		brands: [] as Brand[],
		settings: {} as Record<string, string>,
		amazings: [] as Amazing[],
		products: { data: [] as Product[] },
		sliders: [] as Slider[],
		blogs: [] as BlogPost[]
	};

	const home = await api<HomePayload>('/home', undefined, fetch).catch(() => fallback);

	return {
		categories: home.categories.data ?? [],
		brands: home.brands,
		settings: home.settings,
		amazings: home.amazings,
		featured: home.amazings[0]?.product ?? home.products.data[0] ?? null,
		featuredProducts: home.products.data.slice(0, 8),
		blogPosts: home.blogs,
		sliders: home.sliders
	};
};
