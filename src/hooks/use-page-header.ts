"use client";

import { useEffect, useRef } from "react";

import { type PageBack, useUiStore } from "@/stores/ui-store";

export type UsePageHeaderOptions = {
  back?: PageBack;
  title?: string;
} | null;

/**
 * Tells the `AppShell` top bar to show a back arrow and/or a different title
 * while this content is mounted, and restores the defaults when it unmounts or
 * passes `null`. Sub-pages use this instead of a "Back to …" button in the
 * content.
 *
 * `back.onClick` may be a fresh closure every render: the hook keeps the
 * latest one in a ref and hands the store a stable wrapper, so it never loops.
 *
 * @example
 * usePageHeader(mode === "editor" ? { back: { label: "My documents", onClick: goToList }, title: "Edit document" } : null);
 */
export const usePageHeader = (options: UsePageHeaderOptions) => {
  const setPageHeader = useUiStore((state) => state.setPageHeader);
  const onClickRef = useRef(options?.back?.onClick);

  useEffect(() => {
    onClickRef.current = options?.back?.onClick;
  });

  const isActive = options !== null;
  const title = options?.title;
  const backLabel = options?.back?.label;
  const backHref = options?.back?.href;
  const hasBackClick = Boolean(options?.back?.onClick);

  useEffect(() => {
    if (!isActive) {
      setPageHeader(null);
      return;
    }

    setPageHeader({
      back: backLabel
        ? {
            href: backHref,
            label: backLabel,
            onClick: hasBackClick ? () => onClickRef.current?.() : undefined,
          }
        : undefined,
      title,
    });

    return () => setPageHeader(null);
  }, [backHref, backLabel, hasBackClick, isActive, setPageHeader, title]);
};
