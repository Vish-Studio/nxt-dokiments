"use client";

import type { Icon } from "@phosphor-icons/react";
import { PencilSimpleIcon } from "@phosphor-icons/react";
import type { HTMLInputTypeAttribute } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/commons/button/button";
import { Input } from "@/components/commons/input/input";
import { ProfileFeedbackBanner } from "@/components/dashboard/profile-feedback-banner/profile-feedback-banner";
import {
  SettingsCard,
  type SettingsCardTone,
} from "@/components/dashboard/settings-card/settings-card";
import {
  type SettingsDetail,
  SettingsDetailList,
} from "@/components/dashboard/settings-detail-list/settings-detail-list";
import { useUpdateProfileMutation } from "@/hooks/queries/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import { useToastStore } from "@/stores/toast-store";
import { profileFieldLimits } from "@/types/auth";

/** Every editable profile field. `update-profile` takes them all at once. */
export type ProfileValues = {
  address: string;
  brn: string;
  businessEmail: string;
  companyName: string;
  displayName: string;
  fullName: string;
  phone: string;
  tel: string;
  website: string;
};

export interface ProfileField {
  autoComplete: string;
  label: string;
  name: keyof ProfileValues;
  /** Checked in the browser before saving, matching `ProfileSchema`. */
  pattern?: { message: string; value: RegExp };
  placeholder: string;
  required?: boolean;
  type?: HTMLInputTypeAttribute;
  /** Spans both columns in the read-only view. */
  wide?: boolean;
}

export interface ProfileDetailsCardProps {
  description?: string;
  /** The subset of profile fields this card shows and edits. */
  fields: ProfileField[];
  icon?: Icon;
  /** Shown in the read-only view but never editable here, e.g. the email. */
  readOnlyDetails?: SettingsDetail[];
  title: string;
  tone?: SettingsCardTone;
}

type Feedback = {
  message: string;
  tone: "error";
};

/**
 * A Settings card for part of the profile: read-only label/value pairs with an
 * Edit button, which turns the card into a form for just those fields.
 *
 * `update-profile` replaces the whole profile, so a save sends every field — the
 * ones edited here from the form, the rest unchanged from the account. That lets
 * several cards each own a slice of the profile without overwriting each other.
 */
export const ProfileDetailsCard = ({
  description,
  fields,
  icon,
  readOnlyDetails = [],
  title,
  tone,
}: ProfileDetailsCardProps) => {
  const user = useAuthStore((state) => state.user);
  const { isPending, mutate: updateProfile } = useUpdateProfileMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const showToast = useToastStore((state) => state.showToast);

  const current: ProfileValues = {
    address: user?.address ?? "",
    brn: user?.brn ?? "",
    businessEmail: user?.businessEmail ?? "",
    companyName: user?.companyName ?? "",
    displayName: user?.displayName ?? "",
    fullName: user?.fullName ?? "",
    phone: user?.phone ?? "",
    tel: user?.tel ?? "",
    website: user?.website ?? "",
  };

  const form = useForm<ProfileValues>({ values: current });

  const startEditing = () => {
    setFeedback(null);
    form.reset(current);
    setIsEditing(true);
  };

  const cancel = () => {
    form.reset(current);
    setIsEditing(false);
  };

  const submit = form.handleSubmit((values) => {
    setFeedback(null);

    updateProfile(
      {
        address: values.address.trim(),
        brn: values.brn.trim(),
        businessEmail: values.businessEmail.trim(),
        companyName: values.companyName.trim(),
        displayName: values.displayName.trim(),
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        tel: values.tel.trim(),
        website: values.website.trim(),
      },
      {
        onError: (error) => {
          setFeedback({
            message:
              error instanceof Error
                ? error.message
                : "Unable to update profile.",
            tone: "error",
          });
        },
        onSuccess: () => {
          setIsEditing(false);
          showToast({ message: `${title} updated.`, tone: "success" });
        },
      },
    );
  });

  return (
    <SettingsCard
      action={
        isEditing ? null : (
          <Button
            aria-label={`Edit ${title.toLowerCase()}`}
            icon={<PencilSimpleIcon aria-hidden size={16} weight="bold" />}
            iconPosition="left"
            onClick={startEditing}
            size="sm"
            variant="secondary"
          >
            Edit
          </Button>
        )
      }
      className="profile-details-card"
      description={description}
      icon={icon}
      title={title}
      tone={tone}
    >
      <div className="grid gap-5">
        <ProfileFeedbackBanner feedback={feedback} />

        {isEditing ? (
          <form
            className="grid gap-5"
            onSubmit={submit}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              {/* `maxLength` mirrors `profileFieldLimits`, which ProfileSchema
                  enforces server-side, so an oversized value is stopped here
                  rather than rejected after saving. */}
              {fields.map((field) => (
                <div
                  className={field.wide ? "sm:col-span-2" : undefined}
                  key={field.name}
                >
                  <Input
                    autoComplete={field.autoComplete}
                    error={form.formState.errors[field.name]?.message}
                    label={field.label}
                    maxLength={profileFieldLimits[field.name]}
                    placeholder={field.placeholder}
                    type={field.type}
                    {...form.register(field.name, {
                      pattern: field.pattern,
                      ...(field.required
                        ? {
                            minLength: {
                              message: "Use at least 2 characters.",
                              value: 2,
                            },
                            required: `${field.label} is required.`,
                          }
                        : {}),
                    })}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                disabled={isPending}
                onClick={cancel}
                size="sm"
                variant="ghost"
              >
                Cancel
              </Button>
              <Button
                disabled={isPending}
                size="sm"
                type="submit"
              >
                {isPending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        ) : (
          <SettingsDetailList
            details={[
              ...fields.map((field) => ({
                label: field.label,
                value: current[field.name],
                wide: field.wide,
              })),
              ...readOnlyDetails,
            ]}
          />
        )}
      </div>
    </SettingsCard>
  );
};

export default ProfileDetailsCard;
