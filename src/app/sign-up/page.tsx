import type { Metadata, Viewport } from "next";

import { AuthLayout } from "@/components/commons/auth-layout/auth-layout";
import { SignUpForm } from "@/components/commons/sign-up-form/sign-up-form";
import { pageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = pageMetadata({
  description:
    "Create your free Dokiments account and start making invoices, quotations, and contracts from ready-made templates. Save clients and export polished PDFs.",
  path: "/sign-up",
  title: "Create a free account",
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

const SignUpPage = () => {
  return (
    <AuthLayout
      description="Create a free account. Your role starts as free and updates when your plan changes."
      title="Create account"
    >
      <SignUpForm />
    </AuthLayout>
  );
};

export default SignUpPage;
