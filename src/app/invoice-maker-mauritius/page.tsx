import type { Metadata } from "next";

import { LocalLanding } from "@/components/website/local-landing/local-landing";
import { localPageStructuredData } from "@/lib/seo/local-structured-data";
import { pageMetadata, toJsonLd } from "@/lib/seo/site";
import { mauritiusPage } from "@/lib/website/local-pages";

/**
 * `/invoice-maker-mauritius`: the public landing page for searches such as
 * "invoicing in Mauritius" and "invoice maker Mauritius". Content lives in
 * `mauritiusPage` (`src/lib/website/local-pages.ts`); see `docs/seo.md`.
 */
export const metadata: Metadata = pageMetadata({
  description: mauritiusPage.description,
  path: `/${mauritiusPage.slug}`,
  title: mauritiusPage.title,
});

const Page = () => (
  <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: toJsonLd(localPageStructuredData(mauritiusPage)),
      }}
    />
    <LocalLanding page={mauritiusPage} />
  </>
);

export default Page;
