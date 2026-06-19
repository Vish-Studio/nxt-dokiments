import { AuthLayout } from "@/components/auth-layout/auth-layout";
import { SignUpForm } from "@/components/sign-up-form/sign-up-form";

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
