import type { UIEventHandler, ReactNode } from "react";

export type ContentContainerProps = {
  children?: ReactNode;
  onScroll?: UIEventHandler<HTMLDivElement>;
};

export const ContentContainer = ({ children, onScroll }: ContentContainerProps) => {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-2 sm:p-4 lg:p-6"
      data-testid="content-surface"
      onScroll={onScroll}
    >
      {children}
    </div>
  );
};
