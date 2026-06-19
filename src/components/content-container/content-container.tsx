import type { ReactNode } from "react";

export type ContentContainerProps = {
  children?: ReactNode;
};

export const ContentContainer = ({ children }: ContentContainerProps) => {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-5 pt-4 sm:p-8 sm:pt-6 lg:p-6">
      {children}
    </div>
  );
};
