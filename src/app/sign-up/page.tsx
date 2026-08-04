import type { Viewport } from "next";

import { AuthLayout } from "@/components/commons/auth-layout/auth-layout";
import { SignUpForm } from "@/components/commons/sign-up-form/sign-up-form";

export const viewport: Viewport = {
  themeColor: "#141414",
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
