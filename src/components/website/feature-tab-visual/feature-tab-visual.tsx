import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface FeatureTabVisualProps {
  accent: string;
  /** Rendered instead of the image, e.g. a coded product mockup. */
  children?: ReactNode;
  fit: "contain" | "cover";
  imageAlt: string;
  imageSrc?: string;
  isActive: boolean;
  priority?: boolean;
}

export const FeatureTabVisual = ({
  accent,
  children,
  fit,
  imageAlt,
  imageSrc,
  isActive,
  priority = false,
}: FeatureTabVisualProps) => {
  return (
    <div
      aria-hidden={!isActive}
      className={cn(
        "feature-tab-visual absolute inset-0 transition-[opacity,scale] duration-700 ease-out motion-reduce:transition-none",
        accent,
        isActive
          ? "scale-100 opacity-100"
          : "pointer-events-none scale-105 opacity-0",
      )}
    >
      {children ? (
        <div className="flex size-full items-center justify-center p-6 sm:p-10">
          {children}
        </div>
      ) : imageSrc ? (
        <Image
          alt={imageAlt}
          className={
            fit === "contain" ? "object-contain p-6 sm:p-10" : "object-cover"
          }
          fill
          priority={priority}
          sizes="(min-width: 1024px) 55vw, 100vw"
          src={imageSrc}
        />
      ) : null}
    </div>
  );
};
