import type { Metadata } from "next";

/** Canonical origin for every absolute URL (metadata, sitemap, robots, JSON-LD). */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.dokiments.com"
).replace(/\/$/, "");

export const siteName = "Dokiments";

/** Default title/description: lead with what people search for (invoice, quotation, contract). */
export const defaultTitle =
  "Free Invoice, Quotation & Contract Templates for Small Businesses";

/**
 * The home page `<title>`: the brand first, so a search for "Dokiments" matches
 * the start of the title, then what the product is. Under 60 characters so
 * Google shows it whole.
 */
export const homeTitle = `${siteName}: Free Invoice, Quote & Contract Maker`;

/**
 * Search engine ownership tags, from server-only env vars. Each is the token
 * the console gives you (the `content` value only, not the whole tag). Unset
 * means no tag; the property can also be verified by DNS instead.
 * - `GOOGLE_SITE_VERIFICATION`: Google Search Console, "HTML tag" method.
 * - `BING_SITE_VERIFICATION`: Bing Webmaster Tools, "Meta tag" method.
 */
export const siteVerification: Metadata["verification"] = {
  google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  other: process.env.BING_SITE_VERIFICATION
    ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
    : undefined,
};

export const defaultDescription =
  "Create professional invoices, quotations, contracts, and receipts from ready-made templates. Save your clients, prefill their details in one click, and export a polished PDF in minutes. Free to start.";

interface PageMetadataOptions {
  description: string;
  /** Route path, e.g. "/sign-up". Becomes the canonical URL and og:url. */
  path: string;
  /** Page title; the root layout's template appends "| Dokiments". */
  title: string;
  /** Use the title as-is, without the "| Dokiments" template. */
  absoluteTitle?: boolean;
}

/**
 * Metadata for a public, indexable page. Next.js merges metadata shallowly, so every page sets its
 * own canonical and Open Graph/Twitter objects here instead of inheriting the home page's.
 */
export const pageMetadata = ({
  absoluteTitle = false,
  description,
  path,
  title,
}: PageMetadataOptions): Metadata => {
  const socialTitle = absoluteTitle ? title : `${title} | ${siteName}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: socialTitle,
      description,
      url: path,
      siteName,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
    },
  };
};

/** Metadata for signed-in or utility pages: titled for the tab, but kept out of search results. */
export const privatePageMetadata = (title: string): Metadata => ({
  title,
  robots: { index: false, follow: false },
});

/** Serialises JSON-LD for a <script> tag, escaping "<" so content can't close the tag (per Next.js docs). */
export const toJsonLd = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c");
