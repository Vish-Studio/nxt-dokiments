import { SerwistProvider } from "@serwist/turbopack/react";
import type { Metadata, Viewport } from "next";
import { Raleway, Urbanist } from "next/font/google";
import Script from "next/script";

import { AnalyticsProvider } from "@/components/commons/analytics-provider/analytics-provider";
import { AppUpdateBanner } from "@/components/commons/app-update-banner/app-update-banner";
import { AuthProvider } from "@/components/commons/auth-provider/auth-provider";
import { CookieConsent } from "@/components/website/cookie-consent/cookie-consent";
import { analyticsConfig, hasAnalyticsConfig } from "@/lib/analytics/config";
import { COOKIE_CONSENT_STORAGE_KEY } from "@/lib/cookie-consent";
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://nxt-dokiments.vercel.app",
  ),
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
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: "/apple-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Dokiments",
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
                      gtag('consent', 'update', { 'analytics_storage': 'granted' });
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
            reads. Rendered after `<CookieConsent />` so that if both were ever
            visible at once the banner would paint on top — though the update banner
            waits for the cookie choice precisely so that cannot happen.
          */}
          <AppUpdateBanner />
        </SerwistProvider>
      </body>
    </html>
  );
};

export default RootLayout;
