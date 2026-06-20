import type { Viewport } from "next";

import { AuthLayout } from "@/components/commons/auth-layout/auth-layout";
import { ForgotPasswordForm } from "@/components/commons/forgot-password-form/forgot-password-form";

export const viewport: Viewport = {
  themeColor: "#141414",
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
