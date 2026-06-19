import { AuthLayout } from "@/components/auth-layout/auth-layout";
import { ForgotPasswordForm } from "@/components/forgot-password-form/forgot-password-form";

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
