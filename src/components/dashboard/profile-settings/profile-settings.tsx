"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/commons/button/button";
import { Input } from "@/components/commons/input/input";
import { ProfileFeedbackBanner } from "@/components/dashboard/profile-feedback-banner/profile-feedback-banner";
import { ProfileSummary } from "@/components/dashboard/profile-summary/profile-summary";
import { PromoCodeCard } from "@/components/dashboard/promo-code-card/promo-code-card";
import { useUpdateProfileMutation } from "@/hooks/queries/use-auth";
import { useAuthStore } from "@/stores/auth-store";

type ProfileValues = {
  address: string;
  companyName: string;
  displayName: string;
  fullName: string;
  phone: string;
  tel: string;
};

type Feedback = {
  message: string;
  tone: "error" | "success";
};

export const ProfileSettings = () => {
  const user = useAuthStore((state) => state.user);
  const { isPending, mutate: updateProfile } = useUpdateProfileMutation();

  const [profileFeedback, setProfileFeedback] = useState<Feedback | null>(null);

  const profileForm = useForm<ProfileValues>({
    values: {
      address: user?.address ?? "",
      companyName: user?.companyName ?? "",
      displayName: user?.displayName ?? "",
      fullName: user?.fullName ?? "",
      phone: user?.phone ?? "",
      tel: user?.tel ?? "",
    },
  });

  const submitProfile = profileForm.handleSubmit((values) => {
    setProfileFeedback(null);

    updateProfile(
      {
        address: values.address.trim(),
        companyName: values.companyName.trim(),
        displayName: values.displayName.trim(),
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        tel: values.tel.trim(),
      },
      {
        onError: (error) => {
          setProfileFeedback({
            message: error instanceof Error ? error.message : "Unable to update profile.",
            tone: "error",
          });
        },
        onSuccess: () => {
          setProfileFeedback({ message: "Profile updated.", tone: "success" });
        },
      },
    );
  });

  return (
    <div className="w-full">
      <div className="pb-4">
        <h3 className="font-title text-lg font-bold text-nox-noir">Profile</h3>
        <p className="mt-1 text-sm leading-6 text-nox-noir/60">
          Add your contact and business details. This information stays on your account.
        </p>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <form
          className="grid gap-5 rounded-box border border-steel-mist bg-base-100 p-6"
          onSubmit={submitProfile}
        >
          <ProfileFeedbackBanner feedback={profileFeedback} />
          <Input
            autoComplete="name"
            error={profileForm.formState.errors.displayName?.message}
            label="Display name"
            placeholder="Shown across your workspace"
            {...profileForm.register("displayName", {
              required: "Display name is required.",
              minLength: { message: "Use at least 2 characters.", value: 2 },
            })}
          />
          <Input
            autoComplete="name"
            label="Full name"
            placeholder="Your legal name"
            {...profileForm.register("fullName")}
          />
          <Input
            autoComplete="organization"
            label="Company name"
            placeholder="Your company"
            {...profileForm.register("companyName")}
          />
          <Input
            autoComplete="tel"
            label="Phone"
            placeholder="Mobile number"
            type="tel"
            {...profileForm.register("phone")}
          />
          <Input
            autoComplete="tel-national"
            label="Tel"
            placeholder="Office / landline"
            type="tel"
            {...profileForm.register("tel")}
          />
          <Input
            autoComplete="street-address"
            label="Address"
            placeholder="Street, city, postal code"
            {...profileForm.register("address")}
          />
          <div>
            <Button disabled={isPending} type="submit">
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>

        <div className="grid gap-4">
          <ProfileSummary user={user} />
          <PromoCodeCard />
        </div>
      </div>
    </div>
  );
};
