import { SerwistProvider } from "@serwist/turbopack/react";
import type { Metadata, Viewport } from "next";
import { Raleway, Urbanist, Dancing_Script } from "next/font/google";
import Script from "next/script";

import { AnalyticsProvider } from "@/components/commons/analytics-provider/analytics-provider";
import { AuthProvider } from "@/components/commons/auth-provider/auth-provider";
import { BottomNotices } from "@/components/commons/bottom-notices/bottom-notices";
import { CookieConsent } from "@/components/website/cookie-consent/cookie-consent";
import { analyticsConfig, hasAnalyticsConfig } from "@/lib/analytics/config";
import { COOKIE_CONSENT_STORAGE_KEY } from "@/lib/cookie-consent";
import { QueryProvider } from "@/lib/query/query-provider";
import {
  defaultDescription,
  defaultTitle,
  siteName,
  siteUrl,
} from "@/lib/seo/site";

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

// Reserved for typed signatures (`font-signature`); not a general-purpose UI font.
const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
});

// Defaults for every route. Canonical URLs and og:url are deliberately NOT set here: a page that
// inherited them would tell search engines it is a copy of the home page. Public pages set their
// own through `pageMetadata` (src/lib/seo/site.ts); private ones use `privatePageMetadata`.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${defaultTitle} | ${siteName}`,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  applicationName: siteName,
  category: "business",
  keywords: [
    "invoice template",
    "free invoice maker",
    "quotation template",
    "quote template",
    "contract template",
    "NDA template",
    "receipt template",
    "purchase order template",
    "business document templates",
    "small business documents",
    "freelancer invoice",
    "PDF invoice generator",
  ],
  authors: [{ name: "VISH studio", url: "https://www.vish.studio" }],
  creator: "VISH studio",
  publisher: siteName,
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: "/apple-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteName,
  },
  openGraph: {
    title: `${defaultTitle} | ${siteName}`,
    description: defaultDescription,
    siteName,
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
    card: "summary_large_image",
    title: `${defaultTitle} | ${siteName}`,
    description: defaultDescription,
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
      className={`${urbanist.variable} ${raleway.variable} ${dancingScript.variable} h-full bg-background antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SerwistProvider swUrl="/serwist/sw.js">
          {hasAnalyticsConfig() ? (
            <>
              {/*
                Consent Mode v2 defaults, pushed via `beforeInteractive` so they land
                in `dataLayer` before gtag's own `config` command below. Next.js only
                honors `beforeInteractive` when rendered directly in the root layout —
                see the analytics module's `gtag.ts` for why the shim below pushes
                `arguments` verbatim instead of the repo's usual arrow-function style.
                Also synchronously reads the stored cookie choice so a returning,
                already-accepted user's first hit is already granted.
              */}
              <Script
                id="ga-consent-default"
                strategy="beforeInteractive"
              >
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){ window.dataLayer.push(arguments); }
                  gtag('consent', 'default', {
                    'ad_storage': 'denied',
                    'ad_user_data': 'denied',
                    'ad_personalization': 'denied',
                    'analytics_storage': 'denied'
                  });
                  try {
                    var stored = window.localStorage.getItem('${COOKIE_CONSENT_STORAGE_KEY}');
                    var consent = stored ? JSON.parse(stored) : null;
                    if (consent && consent.version === 1 && consent.choice === 'all') {
                      gtag('consent', 'update', {
                        'ad_storage': 'granted',
                        'ad_user_data': 'granted',
                        'ad_personalization': 'granted',
                        'analytics_storage': 'granted'
                      });
                    }
                  } catch (error) {}
                `}
              </Script>
              <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${analyticsConfig.measurementId}`}
              />
              <Script
                id="ga-config"
                strategy="afterInteractive"
              >
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){ window.dataLayer.push(arguments); }
                  gtag('js', new Date());
                  gtag('config', '${analyticsConfig.measurementId}');
                `}
              </Script>
            </>
          ) : null}
          <QueryProvider>
            <AnalyticsProvider>
              <AuthProvider>{children}</AuthProvider>
            </AnalyticsProvider>
          </QueryProvider>
          <CookieConsent />
          {/*
            Inside `SerwistProvider`, which owns the service worker registration it
            reads, and inside `AuthProvider`'s store, which the install nudge reads
            to stay out of a visitor's way. Rendered after `<CookieConsent />` so
            that if both were ever visible at once these would paint on top — though
            both of them wait for the cookie choice precisely so that cannot happen.
          */}
          <BottomNotices />
        </SerwistProvider>
      </body>
    </html>
  );
};

export default RootLayout;
