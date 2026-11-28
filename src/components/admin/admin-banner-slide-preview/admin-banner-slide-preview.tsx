"use client";

import {
  ClockIcon,
  CrownIcon,
  FilePdfIcon,
  GiftIcon,
  GraduationCapIcon,
  type Icon,
  SignatureIcon,
} from "@phosphor-icons/react";

import type { MarketplacePromoSlideProps } from "@/components/dashboard/marketplace-promo-banner/marketplace-promo-slide";
import { MarketplacePromoSlide } from "@/components/dashboard/marketplace-promo-banner/marketplace-promo-slide";
import {
  type BannerIconKey,
  type BannerSlide,
  bannerToneClassNames,
  visibleBannerPoints,
} from "@/lib/admin/marketplace-banner/banner-slide";
import { cn } from "@/lib/utils";

/** The Phosphor icon behind each stored icon key. Lives here because icons are components, not data. */
export const bannerIcons: Record<BannerIconKey, Icon> = {
  clock: ClockIcon,
  crown: CrownIcon,
  "file-pdf": FilePdfIcon,
  gift: GiftIcon,
  "graduation-cap": GraduationCapIcon,
  signature: SignatureIcon,
};

/**
 * A stored slide as the props the live banner's `MarketplacePromoSlide` takes.
 *
 * Empty fields get placeholder copy, so a half-written draft still previews as
 * a slide rather than collapsing.
 */
export const toPromoSlideProps = (slide: BannerSlide): MarketplacePromoSlideProps => ({
  actionHref: slide.actionHref,
  actionLabel: slide.actionLabel || "Button text",
  backgroundClassName: bannerToneClassNames[slide.tone],
  detail: slide.detail || "One short sentence under the title.",
  eyebrow: slide.eyebrow || "Label",
  eyebrowIcon: bannerIcons[slide.iconKey],
  imageSrc: slide.imageSrc,
  points: visibleBannerPoints(slide.points),
  title: slide.title || "Your title",
});

export interface AdminBannerSlidePreviewProps {
  className?: string;
  /** `phone` renders it in a phone-width frame, as customers on a phone see it. */
  size?: "desktop" | "phone";
  slide: BannerSlide;
}

/**
 * One slide exactly as customers see it: the live banner's own
 * `MarketplacePromoSlide`, never a look-alike, so the preview cannot drift from
 * the real thing.
 */
export const AdminBannerSlidePreview = ({ className, size = "desktop", slide }: AdminBannerSlidePreviewProps) => (
  <div
    className={cn(
      "admin-banner-slide-preview mx-auto w-full",
      size === "phone" ? "h-[34rem] max-w-[23rem]" : "h-80",
      className,
    )}
  >
    <MarketplacePromoSlide {...toPromoSlideProps(slide)} />
  </div>
);

export default AdminBannerSlidePreview;
