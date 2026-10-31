import type { Metadata, Viewport } from "next";
import Link from "next/link";

import { AuthLayout } from "@/components/commons/auth-layout/auth-layout";
import { SignInForm } from "@/components/commons/sign-in-form/sign-in-form";
import { withNext } from "@/lib/auth/auth-link";
import { pageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = pageMetadata({
  description:
    "Sign in to Dokiments to open your invoices, quotations, contracts, saved templates, and clients.",
  path: "/sign-in",
  title: "Sign in",
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

type SignInPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

const SignInPage = async ({ searchParams }: SignInPageProps) => {
  const { next } = await searchParams;

  return (
    <AuthLayout
      description="Sign in to access your documents, templates, and clients."
      footer={
        <p className="text-nox-noir/60">
          Don&apos;t have an account?{" "}
          <Link
            className="font-title font-bold text-nox-noir underline-offset-4 hover:underline"
            href={withNext("/sign-up", typeof next === "string" ? next : null)}
          >
            Sign up
          </Link>
        </p>
      }
      title="Welcome to Dokiments"
    >
      <SignInForm />
    </AuthLayout>
  );
};

export default SignInPage;
