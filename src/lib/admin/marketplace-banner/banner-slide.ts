/**
 * Marketplace banner slides as data, so an administrator can edit them.
 *
 * Today the live banner (`marketplace-promo-banner.tsx`) builds its slides in
 * code. This module is the editable shape those slides will take once they move
 * to Firestore (`siteContent/marketplaceBanner`): icons become a key, colours a
 * tone, images a path under `public/images/marketplace/`, and the button a
 * destination from a fixed list, because a component, a class string or a free
 * URL cannot be stored or safely accepted from a form.
 */

/** Eyebrow icons an administrator can pick, by key. */
export const bannerIconKeys = ["gift", "clock", "crown", "file-pdf", "graduation-cap", "signature"] as const;

export type BannerIconKey = (typeof bannerIconKeys)[number];

/** Names for the icon picker. */
export const bannerIconLabels: Record<BannerIconKey, string> = {
  clock: "Clock",
  crown: "Crown",
  "file-pdf": "PDF",
  gift: "Gift",
  "graduation-cap": "Graduation cap",
  signature: "Signature",
};

/** Slide background colours, the app's play palette. */
export const bannerTones = ["golden", "blue", "purple", "pink", "teal"] as const;

export type BannerTone = (typeof bannerTones)[number];

/** Background class per tone, as `MarketplacePromoSlide` expects it. */
export const bannerToneClassNames: Record<BannerTone, string> = {
  blue: "bg-play-blue",
  golden: "bg-golden-harvest",
  pink: "bg-play-pink",
  purple: "bg-play-purple",
  teal: "bg-play-teal",
};

/** Names shown in the colour picker. */
export const bannerToneLabels: Record<BannerTone, string> = {
  blue: "Blue",
  golden: "Golden",
  pink: "Pink",
  purple: "Purple",
  teal: "Teal",
};

/**
 * Images a slide can use: the composed app screens in `public/images/marketplace/`.
 *
 * A fixed list rather than an upload, because the app has no file storage yet
 * and these are built by `npm run compose:banners` to sit correctly in the slide.
 */
export const bannerImages = [
  { label: "Templates", src: "/images/marketplace/promo-templates.webp" },
  { label: "Offer", src: "/images/marketplace/promo-templates-offer.webp" },
  { label: "Clients", src: "/images/marketplace/promo-clients.webp" },
  { label: "Documents", src: "/images/marketplace/promo-documents.webp" },
  { label: "CV", src: "/images/marketplace/promo-cv.webp" },
] as const;

/**
 * Pages a slide's button can open.
 *
 * A list, not a text field: the button can only ever lead somewhere inside the
 * app, and nobody has to type a path correctly.
 */
export const bannerDestinations = [
  { href: "/marketplace#marketplace-template-sections", label: "Marketplace templates" },
  { href: "/marketplace?type=cv#marketplace-template-sections", label: "CV templates" },
  { href: "/my-templates", label: "My Templates" },
  { href: "/my-documents", label: "My Documents" },
  { href: "/my-clients", label: "My Clients" },
  { href: "/subscription", label: "Subscription" },
] as const;

/**
 * What an administrator decided about a slide.
 * - `draft`: kept out of the banner.
 * - `published`: in the banner, within its dates (see {@link getSlideStatus}).
 */
export type BannerSlideState = "draft" | "published";

/** One editable Marketplace banner slide. */
export type BannerSlide = {
  actionHref: string;
  actionLabel: string;
  /** One short sentence under the title. */
  detail: string;
  eyebrow: string;
  iconKey: BannerIconKey;
  id: string;
  /** A path from {@link bannerImages}. */
  imageSrc: string;
  /** Short proof points shown with checks. At most {@link MAX_BANNER_POINTS}. */
  points: string[];
  /** First day shown, `YYYY-MM-DD`, or `""` for as soon as it is published. */
  showFrom: string;
  /** Last day shown, `YYYY-MM-DD`, or `""` for until it is hidden. */
  showUntil: string;
  state: BannerSlideState;
  title: string;
  tone: BannerTone;
  /** Epoch milliseconds of the last change, for "Edited dd/mm/yy". */
  updatedAt: number;
};

/**
 * Where a slide stands today, worked out from its state and dates.
 * - `draft`: not published.
 * - `ended`: published, but its last day has passed.
 * - `live`: in the rotation customers see now.
 * - `scheduled`: published, starting on a later day.
 *
 * Derived rather than stored, so a scheduled slide goes live on its day without
 * anyone flipping a flag.
 */
export type BannerSlideStatus = "draft" | "ended" | "live" | "scheduled";

/** The slide shows three points on one line; a fourth would wrap under the action. */
export const MAX_BANNER_POINTS = 3;

/** Character ceilings that keep the copy inside the slide's safe zone. */
export const bannerLimits = {
  actionLabel: 30,
  detail: 90,
  eyebrow: 24,
  point: 28,
  title: 60,
} as const;

/** One problem with a slide, keyed by the field it belongs to. */
export type BannerSlideErrors = Partial<
  Record<"actionHref" | "actionLabel" | "detail" | "eyebrow" | "points" | "showUntil" | "title", string>
>;

/**
 * Today as `YYYY-MM-DD` in the viewer's time zone, for comparing with slide dates.
 *
 * @param now - Epoch milliseconds; defaults to the current time.
 */
export const toDayKey = (now: number = Date.now()): string => {
  const date = new Date(now);
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/**
 * Where a slide stands on a given day.
 *
 * @param slide - The slide's state and dates.
 * @param today - `YYYY-MM-DD`, from {@link toDayKey}.
 *
 * @example
 * getSlideStatus({ showFrom: "2026-12-15", showUntil: "", state: "published" }, "2026-11-28"); // "scheduled"
 */
export const getSlideStatus = (
  slide: Pick<BannerSlide, "showFrom" | "showUntil" | "state">,
  today: string,
): BannerSlideStatus => {
  if (slide.state === "draft") return "draft";
  if (slide.showUntil && slide.showUntil < today) return "ended";
  if (slide.showFrom && slide.showFrom > today) return "scheduled";

  return "live";
};

/**
 * The points the slide will actually show: trimmed, without blanks or repeats,
 * capped at {@link MAX_BANNER_POINTS}.
 *
 * The slide keys its list items by text, so a repeated point would collide;
 * dropping repeats here keeps the preview and the live banner identical.
 */
export const visibleBannerPoints = (points: readonly string[]): string[] =>
  [...new Set(points.map((point) => point.trim()).filter(Boolean))].slice(0, MAX_BANNER_POINTS);

/**
 * What stops a slide from being published.
 *
 * Drafts may be incomplete; this is checked when publishing. The button must
 * open one of {@link bannerDestinations}, so a banner can never send customers
 * to another site.
 *
 * @returns An empty object when the slide can be published.
 *
 * @example
 * validateBannerSlide({ ...slide, title: "" }).title; // "Add a title."
 */
export const validateBannerSlide = (
  slide: Pick<
    BannerSlide,
    "actionHref" | "actionLabel" | "detail" | "eyebrow" | "points" | "showFrom" | "showUntil" | "title"
  >,
): BannerSlideErrors => {
  const errors: BannerSlideErrors = {};

  if (!slide.title.trim()) errors.title = "Add a title.";
  else if (slide.title.length > bannerLimits.title) errors.title = `Keep the title under ${bannerLimits.title} characters.`;

  if (!slide.detail.trim()) errors.detail = "Add a sentence under the title.";
  else if (slide.detail.length > bannerLimits.detail) errors.detail = `Keep it under ${bannerLimits.detail} characters.`;

  if (!slide.eyebrow.trim()) errors.eyebrow = "Add a short label.";

  if (!slide.actionLabel.trim()) errors.actionLabel = "Name the button.";

  if (!bannerDestinations.some((destination) => destination.href === slide.actionHref)) {
    errors.actionHref = "Choose where the button goes.";
  }

  if (slide.points.some((point) => point.length > bannerLimits.point)) {
    errors.points = `Keep each item under ${bannerLimits.point} characters.`;
  }

  if (slide.showFrom && slide.showUntil && slide.showUntil < slide.showFrom) {
    errors.showUntil = "The last day can't be before the first.";
  }

  return errors;
};

/**
 * A blank draft for "New slide".
 *
 * @param id - A new, unused slide ID.
 * @param now - Epoch milliseconds for `updatedAt`.
 */
export const createBannerSlide = (id: string, now: number = Date.now()): BannerSlide => ({
  actionHref: bannerDestinations[0].href,
  actionLabel: "Browse templates",
  detail: "",
  eyebrow: "New",
  iconKey: "gift",
  id,
  imageSrc: bannerImages[0].src,
  points: [""],
  showFrom: "",
  showUntil: "",
  state: "draft",
  title: "",
  tone: "golden",
  updatedAt: now,
});

/**
 * Moves a slide one place up or down among the slides with the same status.
 *
 * The rotation order is the order of the list, but only live slides rotate, so
 * moving a live slide "up" must pass over drafts and scheduled slides between
 * it and the previous live one rather than swap with them.
 *
 * @param slides - Every slide, in order. Not mutated.
 * @param id - The slide to move.
 * @param direction - `-1` for up, `1` for down.
 * @param today - `YYYY-MM-DD`, to group slides by status.
 * @returns A new array; the same order when the slide is already first or last
 *   in its group, or does not exist.
 */
export const moveSlide = (
  slides: readonly BannerSlide[],
  id: string,
  direction: -1 | 1,
  today: string,
): BannerSlide[] => {
  const result = [...slides];
  const from = result.findIndex((slide) => slide.id === id);

  if (from === -1) return result;

  const status = getSlideStatus(result[from], today);
  let to = from + direction;

  while (to >= 0 && to < result.length && getSlideStatus(result[to], today) !== status) {
    to += direction;
  }

  if (to < 0 || to >= result.length) return result;

  [result[from], result[to]] = [result[to], result[from]];
  return result;
};
