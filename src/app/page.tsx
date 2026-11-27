import type { Metadata } from "next";

import { Landing } from "@/components/website/landing/landing";
import { homeStructuredData } from "@/lib/seo/home-structured-data";
import {
  defaultDescription,
  homeTitle,
  pageMetadata,
  toJsonLd,
} from "@/lib/seo/site";

export const metadata: Metadata = pageMetadata({
  absoluteTitle: true,
  description: defaultDescription,
  path: "/",
  title: homeTitle,
});

const Page = () => {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(homeStructuredData) }}
      />
      <Landing />
    </>
  );
};

export default Page;
