import type { Metadata, Viewport } from "next";
import { Raleway, Urbanist } from "next/font/google";

import { AuthProvider } from "@/components/commons/auth-provider/auth-provider";
import { QueryProvider } from "@/lib/query/query-provider";

import "./globals.css";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
});

const raleway = Raleway({
  variable: "--font-raleway",
  weight: "900",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://dokiments.com"),
  title: {
    default: "Dokiments | Business Document Templates and Workspace",
    template: "%s | Dokiments",
  },
  description:
    "Create invoices, contracts, quotations, proposals, and reusable business documents from polished templates in one focused workspace.",
  applicationName: "Dokiments",
  keywords: [
    "business document templates",
    "invoice templates",
    "contract templates",
    "quotation templates",
    "proposal templates",
    "document workspace",
    "document generator",
  ],
  authors: [{ name: "Dokiments" }],
  creator: "Dokiments",
  publisher: "Dokiments",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
  },
  openGraph: {
    title: "Dokiments | Business Document Templates and Workspace",
    description:
      "Browse business-ready templates, save the ones that fit, and turn them into polished documents from one workspace.",
    url: "/",
    siteName: "Dokiments",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  twitter: {
    card: "summary",
    title: "Dokiments | Business Document Templates and Workspace",
    description:
      "Create invoices, contracts, quotations, proposals, and reusable business documents from polished templates.",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html
      lang="en"
      data-theme="dokiments"
      className={`${urbanist.variable} ${raleway.variable} h-full bg-background antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
};

export default RootLayout;
