"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * A one-second countdown for actions that must not be repeated straight away.
 *
 * @returns `remaining` — whole seconds left, `0` when idle — and `start`, which
 *   begins a fresh countdown from `seconds`.
 */
export const useCooldown = (seconds: number) => {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (remaining <= 0) {
      return;
    }

    const timer = window.setTimeout(() => setRemaining(remaining - 1), 1000);

    return () => window.clearTimeout(timer);
  }, [remaining]);

  const start = useCallback(() => setRemaining(seconds), [seconds]);

  return { remaining, start };
};
