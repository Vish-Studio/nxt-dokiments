import Link from "next/link";

import { AuthLayout } from "@/components/auth-layout/auth-layout";
import { SignInForm } from "@/components/sign-in-form/sign-in-form";

const SignInPage = () => {
  return (
    <AuthLayout
      description="Use your Dokiments account to access documents, templates, and marketplace tools."
      footer={
        <p className="text-center text-sm text-nox-noir/60">
          New to Dokiments?{" "}
          <Link className="font-title font-bold text-nox-noir hover:text-primary" href="/sign-up">
            Create an account
          </Link>
        </p>
      }
      title="Sign in"
    >
      <SignInForm />
    </AuthLayout>
  );
};

export default SignInPage;
