/** Database stores Rial — display everywhere in Toman. */
export function toman(rial: number | null | undefined): string {
	if (rial === null || rial === undefined) return '—';
	return `${Math.round(rial / 10).toLocaleString('fa-IR')} تومان`;
}

export function faDigits(value: number | string): string {
	return String(value).replace(/[0-9,]/g, (d) =>
		d === ',' ? '٬' : String.fromCharCode(d.charCodeAt(0) + 1728)
	);
}

/** Rough installment split (Rial): down payment + equal monthlies with fee. */
export function installment(
	priceRial: number,
	downPct: number,
	months: number,
	feePct: number
): { down: number; monthly: number } {
	const down = Math.round((priceRial * downPct) / 100);
	const financed = Math.round(((priceRial - down) * (100 + feePct)) / 100);
	return { down, monthly: months > 0 ? Math.round(financed / months) : financed };
}
