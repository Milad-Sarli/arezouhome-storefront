# RTL Rule (standing)

`<html dir="rtl">` is not enough. Every component, dropdown, popover,
dialog, select, command-menu and input must render right-to-left:

- Never use physical `text-left`, `left-*`, `right-*`, `ml-*`, `mr-*`,
  `pl-*`, `pr-*` for directional layout. Use logical `ms-*`, `me-*`,
  `ps-*`, `pe-*`, `start-*`, `end-*`, `text-right`.
- Exception: `left-*`/`right-*` are allowed ONLY for symmetric decorative
  blobs/badges where both sides are set.
- shadcn vendor files in `src/lib/components/ui/`: when upgrading or
  adding components, immediately convert directional classes to logical
  ones (known offenders: accordion trigger `text-left`, dialog close
  button position, command item indicator margins).
- Popover/Command/Select content wrappers must explicitly set
  `dir="rtl"` so portal-rendered DOM never falls back to LTR.
- Verify in browser (or headless DOM check): open every dropdown and
  confirm option text starts from the right.
- Scrollbars must follow the site theme, not the OS: keep
  `color-scheme` in sync (`:root` light / `.dark` dark) and use the
  `.thin-scroll` class on every scrollable dropdown/popover list.
- Toasts (Sonner) must use the site theme store, never an independent
  dark-mode detector.
