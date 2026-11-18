"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Below Tailwind's `sm` breakpoint (40rem = 640px): phones in portrait. The
 * point where menus and short choices switch from anchored popovers and
 * centred modals to a bottom-sheet `Modal`.
 */
export const phoneMediaQuery = "(max-width: 39.99rem)";

/**
 * Whether a CSS media query currently matches, kept in sync as it changes
 * (rotation, window resize).
 *
 * Always `false` during server rendering and hydration, so the first paint
 * matches the server HTML; it updates right after mount. Use it for behaviour
 * that only matters once something is opened, never for initial layout, which
 * belongs in Tailwind classes.
 *
 * @param query - A media query, e.g. {@link phoneMediaQuery}.
 *
 * @example
 * const isPhone = useMediaQuery(phoneMediaQuery);
 */
export const useMediaQuery = (query: string) => {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onStoreChange);

      return () => list.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
};
