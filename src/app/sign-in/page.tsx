import type { Viewport } from "next";

import { AuthLayout } from "@/components/commons/auth-layout/auth-layout";
import { LinkButton } from "@/components/commons/link-button/link-button";
import { SignInForm } from "@/components/commons/sign-in-form/sign-in-form";

export const viewport: Viewport = {
  themeColor: "#141414",
};

const SignInPage = () => {
  return (
    <AuthLayout
      description="Use your Dokiments account to access documents, templates, and marketplace tools."
      footer={
        <div className="grid gap-3 text-center">
          <p className="text-sm text-nox-noir/60">New to Dokiments?</p>
          <LinkButton className="w-full" href="/sign-up" variant="outline">
            Create an account
          </LinkButton>
        </div>
      }
      title="Sign in"
    >
      <SignInForm />
    </AuthLayout>
  );
};

export default SignInPage;
