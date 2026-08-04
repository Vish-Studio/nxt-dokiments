import Image from "next/image";

import { cn } from "@/lib/utils";

export type PageHeaderVisualVariant =
  | "documents"
  | "marketplace"
  | "settings"
  | "subscription"
  | "templates";

export interface PageHeaderVisualProps {
  className?: string;
  variant: PageHeaderVisualVariant;
}

const visualSources: Record<PageHeaderVisualVariant, string> = {
  documents: "/images/page-headers/documents.webp",
  marketplace: "/images/page-headers/marketplace.webp",
  settings: "/images/page-headers/settings.webp",
  subscription: "/images/page-headers/subscription.webp",
  templates: "/images/page-headers/templates.webp",
};

export const PageHeaderVisual = ({ className, variant }: PageHeaderVisualProps) => {
  return (
    <div
      className={cn(
        "page-header-visual relative aspect-square shrink-0 overflow-hidden rounded-box border border-nox-noir/10 bg-white/45",
        className,
      )}
    >
      <Image
        alt=""
        className="object-cover"
        fill
        loading="eager"
        sizes="112px"
        src={visualSources[variant]}
      />
    </div>
  );
};
