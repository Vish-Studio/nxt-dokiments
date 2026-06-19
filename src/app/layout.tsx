import type { Metadata } from "next";
import { Urbanist, Raleway } from "next/font/google";

import { AuthProvider } from "@/components/auth-provider/auth-provider";

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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
};

export default RootLayout;
