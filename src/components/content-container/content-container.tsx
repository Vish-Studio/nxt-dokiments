import type { ReactNode } from "react";

export type ContentContainerProps = {
  children?: ReactNode;
};

export const ContentContainer = ({ children }: ContentContainerProps) => {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5 sm:p-8 lg:px-10">
      {children}
    </div>
  );
};
