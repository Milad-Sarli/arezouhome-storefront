export interface Category {
	id: number;
	title: string;
	slug: string;
	image: string | null;
	children?: Category[];
}

export interface Brand {
	id: number;
	name: string;
	slug: string;
	logo: string | null;
}

export interface ProductVariant {
	id: number;
	color: { name: string; hex: string | null } | null;
	price_rial: number;
	quantity: number;
	image: string | null;
}

export interface ProductSpec {
	attr: string | null;
	value: string;
}

export interface ImageVariant {
	width: number;
	url: string;
}

export interface Product {
	id: number;
	name: string;
	slug: string;
	brand: { id: number; name: string; slug: string } | null;
	warranty: { title: string; type: string; months: number } | null;
	model: string | null;
	product_code: string | null;
	price_rial: number;
	discount_rial: number;
	final_price_rial: number;
	quantity: number;
	in_stock: boolean;
	weight_gram: number | null;
	dimensions_cm: { length: number | string | null; width: number | string | null; height: number | string | null } | null;
	image: string | null;
	image_variants?: ImageVariant[] | null;
	ar_model_url: string | null;
	ar_ios_url: string | null;
	description: string | null;
	categories: Category[];
	variants: ProductVariant[];
	specs: ProductSpec[];
	created_at: string | null;
}

export interface Paginated<T> {
	data: T[];
	meta: { current_page: number; last_page: number; total: number };
}

export interface Address {
	id: number;
	province: string | null;
	city: string | null;
	address: string;
	postal_code: string | null;
	receiver_name: string;
	receiver_mobile: string;
	is_default: boolean;
}

export interface ProvinceWithCities {
	id: number;
	name: string;
	cities: { id: number; name: string }[];
}

export interface Shipment {
	id: number;
	title: string;
	default_price_rial: number;
	logo: string | null;
	is_default: boolean;
}

export interface InstallmentPlan {
	id: number;
	title: string;
	down_payment_percent: number;
	months: number;
	fee_percent: number;
	description: string | null;
}

export interface TicketMessage {
	id: number;
	user_name: string;
	message: string;
	attachment: string | null;
	is_mine: boolean;
	created_at: string | null;
}

export interface Ticket {
	id: number;
	subject: string;
	status: string;
	status_label: string;
	messages: TicketMessage[];
	created_at: string | null;
}

export interface ReturnRequest {
	id: number;
	order_ref: string | null;
	product_name: string | null;
	quantity: number;
	reason: string;
	status: string;
	status_label: string;
	created_at: string | null;
}

export interface OrderItem {
	product_id: number | null;
	product_slug: string | null;
	product_name: string;
	quantity: number;
	unit_price_rial: number;
	total_rial: number;
}

export interface Order {
	id: number;
	ref_code: string;
	status: string;
	status_label: string;
	items: OrderItem[];
	post_price_rial: number;
	discount_price_rial: number;
	final_price_rial: number;
	shipment: string | null;
	created_at: string | null;
}

export interface CheckoutResponse {
	order: Order;
	payment_url: string | null;
	payment_form: { method: string; inputs: Record<string, string> } | null;
}

export interface Amazing {
	id: number;
	product: Product;
	percent: number;
	price_rial: number | null;
	end_at: string | null;
}

export interface BlogPost {
	id: number;
	title: string;
	slug: string;
	image: string | null;
	description: string | null;
	excerpt: string | null;
	meta_title: string | null;
	meta_description: string | null;
	canonical_url: string | null;
	is_featured: boolean;
	views: number;
	reading_minutes: number;
	category: string | null;
	publish_at: string | null;
}

export type Settings = Record<string, string>;
