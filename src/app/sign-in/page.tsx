import type { Viewport } from "next";
import Link from "next/link";

import { AuthLayout } from "@/components/commons/auth-layout/auth-layout";
import { SignInForm } from "@/components/commons/sign-in-form/sign-in-form";

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

const SignInPage = () => {
  return (
    <AuthLayout
      description="Sign in to access your documents, templates, and clients."
      footer={
        <p className="text-nox-noir/60">
          Don&apos;t have an account?{" "}
          <Link
            className="font-title font-bold text-nox-noir underline-offset-4 hover:underline"
            href="/sign-up"
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
