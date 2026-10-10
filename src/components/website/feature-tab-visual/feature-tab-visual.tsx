import Image from "next/image";

import { cn } from "@/lib/utils";

export interface FeatureTabVisualProps {
  accent: string;
  fit: "contain" | "cover";
  imageAlt: string;
  imageSrc: string;
  isActive: boolean;
  priority?: boolean;
}

export const FeatureTabVisual = ({
  accent,
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
    </div>
  );
};
