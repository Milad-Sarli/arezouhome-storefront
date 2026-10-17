import { toJalaali } from 'jalaali-js';

const MONTHS = [
	'فروردین',
	'اردیبهشت',
	'خرداد',
	'تیر',
	'مرداد',
	'شهریور',
	'مهر',
	'آبان',
	'آذر',
	'دی',
	'بهمن',
	'اسفند'
];

/** ISO string -> '1405/06/15' (fa digits). DB/API store Gregorian, display Jalali. */
export function jalali(iso: string | null | undefined): string {
	if (!iso) return '—';
	const d = new Date(iso);
	const { jy, jm, jd } = toJalaali(d);
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${jy}/${pad(jm)}/${pad(jd)}`.replace(/[0-9]/g, (d) =>
		String.fromCharCode(d.charCodeAt(0) + 1728)
	);
}

/** ISO string -> '۱۵ شهریور ۱۴۰۵' */
export function jalaliLong(iso: string | null | undefined): string {
	if (!iso) return '—';
	const d = new Date(iso);
	const { jy, jm, jd } = toJalaali(d);
	const fa = (n: number) =>
		String(n).replace(/[0-9]/g, (x) => String.fromCharCode(x.charCodeAt(0) + 1728));
	return `${fa(jd)} ${MONTHS[jm - 1]} ${fa(jy)}`;
}
