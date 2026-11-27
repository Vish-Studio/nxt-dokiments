import { siteName, siteUrl } from "@/lib/seo/site";
import type { LocalPage } from "@/lib/website/local-pages";

/**
 * JSON-LD for a local landing page: the page itself (linked to the site and
 * organisation declared on the home page), a breadcrumb, the product as a free
 * web app serving that country, and the page's FAQ. Built from the same data
 * the page renders, so the two can never disagree.
 */
export const localPageStructuredData = (page: LocalPage) => {
  const url = `${siteUrl}/${page.slug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        about: { "@id": `${url}#app` },
        description: page.description,
        isPartOf: { "@id": `${siteUrl}/#website` },
        name: page.heading,
        url,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", item: siteUrl, name: siteName, position: 1 },
          { "@type": "ListItem", item: url, name: page.heading, position: 2 },
        ],
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${url}#app`,
        applicationCategory: "BusinessApplication",
        areaServed: { "@type": "Country", name: page.country },
        description: page.description,
        name: `${siteName} invoice maker`,
        offers: { "@type": "Offer", price: "0", priceCurrency: "MUR" },
        operatingSystem: "Web, iOS, Android",
        publisher: { "@id": `${siteUrl}/#organization` },
        url,
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faqs.map((faq) => ({
          "@type": "Question",
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
          name: faq.question,
        })),
      },
    ],
  };
};
