"use client";

import { useCallback } from "react";

/** Returns the dashboard content viewport to its start after mobile collection changes. */
export const useScrollContentToTopOnMobile = () =>
  useCallback(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) return;

    document
      .querySelector<HTMLElement>('[data-testid="content-surface"]')
      ?.scrollTo({ behavior: "smooth", top: 0 });
  }, []);

export default useScrollContentToTopOnMobile;
