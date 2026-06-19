"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/button/button";
import { Input } from "@/components/input/input";
import { ProfileSummary } from "@/components/profile-summary/profile-summary";
import { updateAccountProfile } from "@/lib/firebase/rest-auth";
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

const Banner = ({ feedback }: { feedback: Feedback | null }) => {
  if (!feedback) {
    return null;
  }

  return (
    <div
      className={
        feedback.tone === "success"
          ? "rounded-box bg-success/10 px-4 py-3 text-sm text-success"
          : "rounded-box bg-error/10 px-4 py-3 text-sm text-error"
      }
      role="status"
    >
      {feedback.message}
    </div>
  );
};

export const ProfileSettings = () => {
  const session = useAuthStore((state) => state.session);
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);

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

  const submitProfile = profileForm.handleSubmit(async (values) => {
    setProfileFeedback(null);

    if (!session) {
      setProfileFeedback({ message: "Your session expired. Please sign in again.", tone: "error" });
      return;
    }

    try {
      const updatedSession = await updateAccountProfile(session, {
        address: values.address.trim(),
        companyName: values.companyName.trim(),
        displayName: values.displayName.trim(),
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        tel: values.tel.trim(),
      });
      setSession(updatedSession);
      setProfileFeedback({ message: "Profile updated.", tone: "success" });
    } catch (error) {
      setProfileFeedback({
        message: error instanceof Error ? error.message : "Unable to update profile.",
        tone: "error",
      });
    }
  });

  return (
    <div className="w-full">
      <div className="border-b border-steel-mist pb-4">
        <h3 className="font-title text-lg font-bold text-bloodwood-deep">Profile</h3>
        <p className="mt-1 text-sm leading-6 text-nox-noir/60">
          Add your contact and business details. This information stays on your account.
        </p>
      </div>

      <div className="mt-6 grid items-start gap-4 lg:grid-cols-2">
        <form
          className="grid gap-5 rounded-box border border-steel-mist bg-base-100 p-6"
          onSubmit={submitProfile}
        >
          <Banner feedback={profileFeedback} />
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
            <Button disabled={profileForm.formState.isSubmitting} type="submit">
              {profileForm.formState.isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>

        <ProfileSummary user={user} />
      </div>
    </div>
  );
};
