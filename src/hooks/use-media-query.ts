/**
 * Below Tailwind's `sm` breakpoint (40rem = 640px): phones in portrait. The
 * point where menus and short choices switch from anchored popovers and
 * centred modals to a bottom-sheet `Modal`.
 */
export const phoneMediaQuery = "(max-width: 39.99rem)";

/**
 * Tailwind's `lg` breakpoint (64rem = 1024px) and up: the desktop shell with
 * the sidebar. Where the template picker gains its live preview pane, so a row
 * click selects a template instead of starting the document.
 */
export const desktopMediaQuery = "(min-width: 64rem)";
