import type { ReactNode } from "react";

import { GridFour } from "@phosphor-icons/react";

export type ContentContainerProps = {
  children?: ReactNode;
};

export function ContentContainer({ children }: ContentContainerProps) {
  return (
    <div className="flex min-h-0 flex-1 px-5 pt-5 pb-5 sm:px-8 sm:pt-6 sm:pb-8 lg:px-10">
      <div
        className="flex min-h-full flex-1 items-center justify-center rounded-box border border-dashed border-steel-mist bg-base-100"
        data-testid="content-surface"
      >
        {children ?? (
          <GridFour
            aria-hidden
            className="text-steel-mist"
            size={48}
            weight="bold"
          />
        )}
      </div>
    </div>
  );
}
