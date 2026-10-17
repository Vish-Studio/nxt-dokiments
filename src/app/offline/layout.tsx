import type { Metadata } from "next";

import { privatePageMetadata } from "@/lib/seo/site";

// The offline page is a client component, so its noindex metadata lives here.
export const metadata: Metadata = privatePageMetadata("Offline");

const OfflineLayout = ({ children }: { children: React.ReactNode }) => children;

export default OfflineLayout;
