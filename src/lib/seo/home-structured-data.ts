import { defaultDescription, siteName, siteUrl } from "@/lib/seo/site";

/**
 * Home page JSON-LD: who makes the product (Organization), the site itself (WebSite), and the
 * product as a free-to-start web app (SoftwareApplication) so search engines can show it as one.
 * The FAQPage schema lives with the FAQ section (`Faq`).
 */
export const homeStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: siteName,
      // Helps the brand query: people type it a few ways.
      alternateName: ["Dokiments app", "dokiments.com"],
      description:
        "Dokiments is an online invoice, quotation and contract maker for small businesses and freelancers.",
      url: siteUrl,
      logo: `${siteUrl}/apple-icon.png`,
      areaServed: [
        { "@type": "Country", name: "Mauritius" },
        { "@type": "Place", name: "Worldwide" },
      ],
      // The footer's social profiles belong to the studio behind the product.
      parentOrganization: {
        "@type": "Organization",
        name: "VISH studio",
        url: "https://www.vish.studio",
        sameAs: [
          "https://www.linkedin.com/company/vish-studio",
          "https://www.instagram.com/vish.studio",
          "https://www.facebook.com/vishstudio/",
        ],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: siteName,
      alternateName: "Dokiments app",
      inLanguage: "en",
      url: siteUrl,
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      name: siteName,
      url: siteUrl,
      description: defaultDescription,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web, iOS, Android",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "Invoice templates",
        "Quotation templates",
        "Contract and NDA templates",
        "Receipt and purchase order templates",
        "Saved clients with one-click prefill",
        "PDF export",
        "Works on desktop and mobile",
      ],
      publisher: { "@id": `${siteUrl}/#organization` },
    },
  ],
};
