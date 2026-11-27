# SEO

How the public site is set up for search, and what has to happen outside the
code for it to be found.

## Why "dokiments" didn't find the site (November 2026)

The site was crawlable (robots allow `/`, `index, follow`, canonical on
`https://www.dokiments.com`, a sitemap), but it was **not indexed**: search
engines had never been told it exists, and a new domain with no links pointing
to it can wait weeks or months to be discovered. No verification tag was
present either, so it had never been added to Google Search Console.

Code can't index a site. The fix is the console steps below, then the code
changes here to rank once indexed.

## Steps outside the code (owner only)

1. **Google Search Console** (search.google.com/search-console): add a *Domain*
   property for `dokiments.com` and verify it with the DNS TXT record (covers
   `www` and the bare domain). Or add a *URL prefix* property for
   `https://www.dokiments.com/`, choose *HTML tag*, and set
   `GOOGLE_SITE_VERIFICATION` in Vercel (Production) to the tag's `content`
   value, then redeploy.
2. In Search Console: **Sitemaps** → submit `https://www.dokiments.com/sitemap.xml`.
3. **URL inspection** → *Request indexing* for `/` and `/invoice-maker-mauritius`.
4. **Bing Webmaster Tools** (bing.com/webmasters): import from Google Search
   Console, or verify with `BING_SITE_VERIFICATION`. Bing also feeds DuckDuckGo
   and Yahoo.
5. **Google Business Profile**, if there is a real business address in
   Mauritius: it is the main signal for local searches.
6. **Links**: list Dokiments where Mauritian businesses look (business
   directories, the studio site vish.studio, LinkedIn and Facebook pages linking
   to `https://www.dokiments.com`). A brand-new site ranks on links as much as
   on content.

Expect the brand query ("dokiments") to work within days of indexing; generic
queries ("invoicing in Mauritius") take longer and depend on links.

## What the code does

| Piece | Where | What it does |
| --- | --- | --- |
| Home title | `homeTitle` in `src/lib/seo/site.ts` | "Dokiments: Free Invoice, Quote & Contract Maker": brand first, under 60 characters |
| Verification tags | `siteVerification` in `src/lib/seo/site.ts` | Google and Bing meta tags from `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION` (server-only; unset means no tag) |
| Structured data (home) | `src/lib/seo/home-structured-data.ts` | Organization (with `alternateName`, `areaServed` Mauritius), WebSite, SoftwareApplication; FAQPage from the FAQ section |
| Local landing pages | `src/lib/website/local-pages.ts`, `LocalLanding`, `/invoice-maker-mauritius` | A page per market search, with WebPage, BreadcrumbList, SoftwareApplication (`areaServed`) and FAQPage JSON-LD built from the same data it renders |
| Sitemap | `src/app/sitemap.ts` | Public pages only, including local landing pages. Each has a fixed `lastModified` (bump it when that page's content changes; a date that moves on every request is ignored by Google) and the home and local pages list the social image for Google Images. `sitemap.test.ts` checks no listed path is disallowed in robots |
| Robots | `src/app/robots.ts` | Allows the site, disallows signed-in routes (kept in sync with `src/proxy.ts`) and `/shared/` invitation links |
| Preview host | `next.config.ts` `headers()` | `X-Robots-Tag: noindex` on `*.vercel.app`, so only `www.dokiments.com` is indexed |
| Footer link | `footerProductLinks` | "Invoicing in Mauritius" on every public page, so crawlers find the local page |

`siteUrl` falls back to `https://www.dokiments.com`. Set `NEXT_PUBLIC_SITE_URL`
to that in Production so canonicals, the sitemap and JSON-LD all use the
indexed host.

## Adding another local page

Add a `LocalPage` to `src/lib/website/local-pages.ts`, a route under
`src/app/<slug>/page.tsx` like `invoice-maker-mauritius`, a sitemap entry and a
footer link. Every claim in its copy must be true of the product (amounts and
tax are free-text fields: say "write amounts in rupees", not "automatic VAT").

## Ideas not done yet

- Public template pages (`/templates/invoice`, `/templates/quotation`, …) with a
  live preview: the strongest next step for "invoice template" searches. The
  Marketplace is signed-in only today, so these would be new public routes.
- A short guide such as "How to write an invoice in Mauritius (VAT, BRN)".
