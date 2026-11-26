import type { ReactNode, UIEventHandler } from "react";

export type ContentContainerProps = {
  children?: ReactNode;
  onScroll?: UIEventHandler<HTMLDivElement>;
};

/**
 * The page's only scroll area: everything below the shell's frame scrolls here,
 * never the document. `overscroll-y-contain` stops a scroll that reaches the
 * end from chaining to the page behind it (the "two scrolls" on phones).
 */
export const ContentContainer = ({
  children,
  onScroll,
}: ContentContainerProps) => {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-y-contain p-4 lg:p-6 [overflow-anchor:none]"
      data-testid="content-surface"
      onScroll={onScroll}
    >
      {children}
    </div>
  );
};
