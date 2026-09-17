"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

const PAGE_HEADER_CONTROLS_ID = "page-header-controls";
const MOBILE_PAGE_HEADER_CONTROLS_ID = "mobile-page-header-controls";

export interface ResponsiveHeaderControlsProps {
  children: ReactNode;
  desktopContent: ReactNode;
  desktopHeader: ReactNode;
}

/** Keeps collection controls below the header on mobile and in its desktop slot. */
export const ResponsiveHeaderControls = ({
  children,
  desktopContent,
  desktopHeader,
}: ResponsiveHeaderControlsProps) => {
  const [desktopTarget, setDesktopTarget] = useState<HTMLElement | null>(null);
  const [mobileTarget, setMobileTarget] = useState<HTMLElement | null>(null);
  const [isStandalone, setIsStandalone] = useState(
    () => typeof document !== "undefined" && !document.getElementById(PAGE_HEADER_CONTROLS_ID),
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(PAGE_HEADER_CONTROLS_ID);
      setDesktopTarget(target);
      setMobileTarget(document.getElementById(MOBILE_PAGE_HEADER_CONTROLS_ID));
      setIsStandalone(!target);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      {desktopTarget
        ? createPortal(
            <div className="hidden lg:block [&_.collection-toolbar]:border-0 [&_.collection-toolbar]:pb-0">
              {desktopHeader}
            </div>,
            desktopTarget,
          )
        : null}
      {mobileTarget
        ? createPortal(
            <div className="lg:hidden">{children}</div>,
            mobileTarget,
          )
        : <div className="lg:hidden">{children}</div>}
      {desktopTarget || isStandalone ? (
        <div className="hidden lg:block [&_.collection-toolbar>div:first-child]:justify-start [&_.collection-toolbar>div:first-child>div:first-child]:hidden">
          {desktopContent}
        </div>
      ) : null}
    </>
  );
};

export default ResponsiveHeaderControls;
