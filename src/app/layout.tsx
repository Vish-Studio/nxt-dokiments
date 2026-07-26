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
  title: "Dokiments",
  description: "Document workflows for modern teams.",
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
