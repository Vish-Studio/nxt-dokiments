import {
  BatteryFull,
  CellSignalFull,
  WifiHigh,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

import { cn } from "@/lib/utils";

export interface DevicePhoneProps {
  /** Describes the screen, for people who cannot see it. */
  alt: string;
  className?: string;
  /** Intrinsic height of `src` in pixels. */
  height: number;
  /** Load eagerly; set it only for an above-the-fold screen (the hero). */
  priority?: boolean;
  /** `next/image` sizes. The phone is narrow, so keep this small. */
  sizes: string;
  /** A real app screen from `public/images/mockups/app/`. */
  src: string;
  /**
   * - `dark` (default): no shadow, for nox-noir panels.
   * - `light`: the soft shadow, for white or pastel panels.
   */
  tone?: "dark" | "light";
  /** Intrinsic width of `src` in pixels. */
  width: number;
}

/**
 * A modern phone around a real app screenshot, for marketing mockups: a
 * nox-noir bezel, a camera island, a status bar (9:41, signal, Wi-Fi,
 * battery) and the screen, cropped to a phone's 393 × 852 ratio.
 *
 * Every size is in container units (`cqw`), so the frame keeps its
 * proportions at any width, from the hero to a phone-sized section.
 */
export const DevicePhone = ({
  alt,
  className,
  height,
  priority = false,
  sizes,
  src,
  tone = "dark",
  width,
}: DevicePhoneProps) => (
  // The wrapper is the size container; the bezel and screen inside are sized
  // in `cqw` of it (an element cannot use its own width as the container).
  <div className={cn("device-phone @container", className)}>
    <div
      className={cn(
        "relative rounded-[16cqw] bg-nox-noir p-[3cqw] ring-1 ring-white/8",
        tone === "light" && "shadow-soft",
      )}
    >
      <div className="relative aspect-393/852 overflow-hidden rounded-[13cqw] bg-base-100">
        <span
          aria-hidden
          className="absolute left-1/2 top-[2.8cqw] z-20 h-[7.6cqw] w-[28%] -translate-x-1/2 rounded-full bg-nox-noir"
        />
        <div
          aria-hidden
          className="relative z-10 flex h-[13cqw] items-center justify-between bg-base-100 px-[8.5cqw] pt-[1.5cqw] font-title text-[4.4cqw] font-semibold text-nox-noir"
        >
          <span>9:41</span>
          <span className="flex items-center gap-[1.4cqw]">
            <CellSignalFull
              size="1em"
              weight="fill"
            />
            <WifiHigh
              size="1em"
              weight="bold"
            />
            <BatteryFull
              size="1.25em"
              weight="fill"
            />
          </span>
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
    </div>
  </div>
);

export default DevicePhone;
