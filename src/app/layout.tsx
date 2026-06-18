import type { Metadata } from "next";
import { Host_Grotesk, Elms_Sans } from "next/font/google";
import "./globals.css";

const hostGrotesk = Host_Grotesk({
  variable: "--font-host-grotesk",
  subsets: ["latin"],
});

const elmsSans = Elms_Sans({
  variable: "--font-elms-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NuDocuments",
  description: "Document workflows for modern teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="nudocuments"
      className={`${hostGrotesk.variable} ${elmsSans.variable} h-full bg-background antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
