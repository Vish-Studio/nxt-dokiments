import Image from "next/image";

import { cn } from "@/lib/utils";

export interface DeviceBrowserProps {
  /** Describes the screen, for people who cannot see it. */
  alt: string;
  className?: string;
  /** Intrinsic height of `src` in pixels. */
  height: number;
  /** Load eagerly; set it only for an above-the-fold screen (the hero). */
  priority?: boolean;
  /** `next/image` sizes, so phones do not download the 2× desktop capture. */
  sizes: string;
  /** A real app screen from `public/images/mockups/app/`. */
  src: string;
  /**
   * - `dark` (default): a faint white ring, for nox-noir panels.
   * - `light`: a nox-noir ring and the soft shadow, for white or pastel panels.
   */
  tone?: "dark" | "light";
  /** Text in the address bar. Decorative. */
  url?: string;
  /** Intrinsic width of `src` in pixels. */
  width: number;
}

/**
 * A minimal browser window around a real app screenshot, for marketing
 * mockups: a dark title bar with three dots and the address, then the screen.
 *
 * The screenshot comes from `npm run capture:marketing`, so the window always
 * shows the current dashboard rather than a drawing of it.
 */
export const DeviceBrowser = ({
  alt,
  className,
  height,
  priority = false,
  sizes,
  src,
  tone = "dark",
  url = "dokiments.com/dashboard",
  width,
}: DeviceBrowserProps) => (
  <div
    className={cn(
      "device-browser overflow-hidden rounded-box bg-nox-noir",
      tone === "light"
        ? "shadow-soft ring-1 ring-nox-noir/10"
        : "ring-1 ring-white/12",
      className,
    )}
  >
    <div
      aria-hidden
      className="flex h-9 items-center gap-1.5 border-b border-white/6 bg-white/6 px-3.5"
    >
      <span className="size-2.5 rounded-full bg-white/16" />
      <span className="size-2.5 rounded-full bg-white/16" />
      <span className="size-2.5 rounded-full bg-white/16" />
      <span className="mx-auto max-w-[60%] flex-1 truncate rounded-md bg-white/7 px-3 py-0.5 text-center font-body text-xs text-white/55">
        {url}
      </span>
      <span className="w-12" />
    </div>
    <Image
      alt={alt}
      className="block h-auto w-full"
      height={height}
      priority={priority}
      sizes={sizes}
      src={src}
      width={width}
    />
  </div>
);

export default DeviceBrowser;
