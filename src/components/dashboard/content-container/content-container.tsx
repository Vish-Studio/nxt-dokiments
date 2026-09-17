import type { ReactNode, UIEventHandler } from "react";

export type ContentContainerProps = {
  children?: ReactNode;
  onScroll?: UIEventHandler<HTMLDivElement>;
};

export const ContentContainer = ({
  children,
  onScroll,
}: ContentContainerProps) => {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4 lg:p-6 [overflow-anchor:none]"
      data-testid="content-surface"
      onScroll={onScroll}
    >
      {children}
    </div>
  );
};
