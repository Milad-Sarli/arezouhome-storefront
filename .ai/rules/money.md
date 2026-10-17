# Money Rule (standing)

Database stores Rial (integer). Humans only ever see Toman:

- Display: always use `toman()` from `$lib/format/money.ts`
  (fa-IR digits, thousand separators, «تومان» suffix).
- Inputs: every numeric money field MUST live-format thousand
  separators while typing. Use `TomanInput` from
  `$lib/components/TomanInput.svelte` (emits raw digits, shows
  grouped fa-IR digits). Never leave a bare `<input inputmode=numeric>`
  for money.
- Never trust client-side totals: server recomputes all prices.
