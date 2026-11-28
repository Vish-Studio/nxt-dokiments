import type { BannerSlideStatus } from "@/lib/admin/marketplace-banner/banner-slide";
import type { AdminStatusTone } from "@/lib/admin/status-tone";

/** Words for each slide status. */
export const bannerStatusLabels: Record<BannerSlideStatus, string> = {
  draft: "Draft",
  ended: "Ended",
  live: "Live",
  scheduled: "Scheduled",
};

/** Pill colour for each slide status: live is green, waiting golden, the rest grey. */
export const bannerStatusTones: Record<BannerSlideStatus, AdminStatusTone> = {
  draft: "neutral",
  ended: "neutral",
  live: "success",
  scheduled: "warning",
};
