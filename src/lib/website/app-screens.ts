/** One captured app screen, ready for `next/image`. */
export type AppScreen = {
  /** Describes what the screen shows, for screen readers. */
  alt: string;
  /** Intrinsic height in pixels. */
  height: number;
  /** Path under `public/`. */
  src: string;
  /** Intrinsic width in pixels. */
  width: number;
};

/**
 * The real app screens the marketing pages show inside device frames. They
 * are written by `npm run capture:marketing` (see
 * `scripts/capture-marketing-screens.mjs`); when that script changes a size or
 * adds a screen, update this list in the same change.
 *
 * - `dashboard`, `documents`, `cv`, `templates`, `clients`, `marketplace`:
 *   desktop pages (1440 × 900 at 2×), one per workspace tab.
 * - `companyPhone`: a company page on a phone (393 × 852 at 3×).
 * - `notificationsPhone`: the notification sheet on a phone, cropped to start
 *   at the sheet (393 wide at 3×).
 */
export const appScreens = {
  clients: {
    alt: "Dokiments My Clients: saved clients with their company, email and phone",
    height: 1800,
    src: "/images/mockups/app/clients-desktop.webp",
    width: 2880,
  },
  companyPhone: {
    alt: "Dokiments on a phone: a company's contact details and its documents",
    height: 2556,
    src: "/images/mockups/app/company-phone.webp",
    width: 1179,
  },
  cv: {
    alt: "A CV being edited in Dokiments, with the finished CV beside the form",
    height: 1800,
    src: "/images/mockups/app/cv-desktop.webp",
    width: 2880,
  },
  dashboard: {
    alt: "The Dokiments dashboard: a welcome card, a workspace snapshot and the latest document",
    height: 1800,
    src: "/images/mockups/app/dashboard-desktop.webp",
    width: 2880,
  },
  documents: {
    alt: "Dokiments My Documents: documents grouped by company, with type, amount and status",
    height: 1800,
    src: "/images/mockups/app/documents-desktop.webp",
    width: 2880,
  },
  marketplace: {
    alt: "The Dokiments marketplace: template categories and styles to browse",
    height: 1800,
    src: "/images/mockups/app/marketplace-desktop.webp",
    width: 2880,
  },
  notificationsPhone: {
    alt: "Dokiments notifications on a phone: new templates, shared documents and signatures",
    height: 2306,
    src: "/images/mockups/app/notifications-phone.webp",
    width: 1179,
  },
  templates: {
    alt: "Dokiments My Templates: the saved templates library",
    height: 1800,
    src: "/images/mockups/app/templates-desktop.webp",
    width: 2880,
  },
} satisfies Record<string, AppScreen>;

/** One of the hero's device scenes, shown while its step is active. */
export type HeroScene = AppScreen & {
  /**
   * `object-position` class for the `object-cover` crop, keeping the devices
   * in view when the hero column is taller than the 4 : 3 scene.
   */
  position: string;
};

/**
 * The hero's three scenes, one per step in `hero-intro-steps.ts` and keyed by
 * its `id`, each in its own device style (2400 × 1800, composed by
 * `npm run capture:marketing`).
 *
 * - `template`: the marketplace on a laptop resting on a rock.
 * - `client`: My Clients and an invoice prefilled from a client, on two phones.
 * - `send`: the finished invoice on a laptop, "Document ready" on a phone.
 */
export const heroScenes = {
  client: {
    alt: "Dokiments on two phones: the client book, and a new invoice with the client's details filled in",
    height: 1800,
    position: "object-[47%_50%]",
    src: "/images/mockups/app/hero-client.webp",
    width: 2400,
  },
  send: {
    alt: "A finished invoice in the Dokiments editor on a laptop, and its PDF ready to download on a phone",
    height: 1800,
    position: "object-[50%_50%]",
    src: "/images/mockups/app/hero-send.webp",
    width: 2400,
  },
  template: {
    alt: "The Dokiments marketplace on a laptop resting on a dark rock",
    height: 1800,
    position: "object-[58%_50%]",
    src: "/images/mockups/app/hero-template.webp",
    width: 2400,
  },
} satisfies Record<string, HeroScene>;
