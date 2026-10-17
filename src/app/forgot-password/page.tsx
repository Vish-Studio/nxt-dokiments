import type { Metadata, Viewport } from "next";

import { AuthLayout } from "@/components/commons/auth-layout/auth-layout";
import { ForgotPasswordForm } from "@/components/commons/forgot-password-form/forgot-password-form";
import { privatePageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privatePageMetadata("Reset your password");

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

const ForgotPasswordPage = () => {
  return (
    <AuthLayout
      description="Enter your account email and Firebase will send a password reset link."
      title="Reset password"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
