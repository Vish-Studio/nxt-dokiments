import { DeviceBrowser } from "@/components/website/device-browser/device-browser";
import type { AppScreen } from "@/lib/website/app-screens";
import { cn } from "@/lib/utils";

export interface FeatureTabVisualProps {
  /** Panel background, the tab's page tone (for example `bg-play-teal`). */
  background: string;
  isActive: boolean;
  /** Load eagerly; set it only for the first tab, which shows on load. */
  priority?: boolean;
  /** The real app page this tab talks about, from `appScreens`. */
  screen: AppScreen;
  /**
   * - `light` (default): the browser casts the soft shadow, for pastel panels.
   * - `dark`: a faint white ring, for the noir panel.
   */
  tone?: "dark" | "light";
}

/**
 * One workspace tab's picture: the real page in a browser window on the tab's
 * page tone, bleeding off the bottom-right edge so it reads as a close-up.
 * Every tab stays mounted and cross-fades; inactive ones are `aria-hidden`.
 */
export const FeatureTabVisual = ({
  background,
  isActive,
  priority = false,
  screen,
  tone = "light",
}: FeatureTabVisualProps) => {
  return (
    <div
      aria-hidden={!isActive}
      className={cn(
        "feature-tab-visual absolute inset-0 overflow-hidden transition-[opacity,scale] duration-700 ease-out motion-reduce:transition-none",
        background,
        isActive
          ? "scale-100 opacity-100"
          : "pointer-events-none scale-105 opacity-0",
      )}
    >
      <DeviceBrowser
        alt={screen.alt}
        className="absolute left-[9%] top-[11%] w-[112%]"
        height={screen.height}
        priority={priority}
        sizes="(min-width: 1024px) 62vw, 112vw"
        src={screen.src}
        tone={tone}
        width={screen.width}
      />
    </div>
  );
};
