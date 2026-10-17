"use client";

import { BuildingsIcon, IdentificationCardIcon } from "@phosphor-icons/react";

import {
  type ProfileField,
  ProfileDetailsCard,
} from "@/components/dashboard/profile-details-card/profile-details-card";
import { ProfileOverviewCard } from "@/components/dashboard/profile-overview-card/profile-overview-card";
import { useAuthStore } from "@/stores/auth-store";

const personalFields: ProfileField[] = [
  {
    autoComplete: "name",
    label: "Display name",
    name: "displayName",
    placeholder: "Shown across your workspace",
    required: true,
  },
  {
    autoComplete: "name",
    label: "Full name",
    name: "fullName",
    placeholder: "Your legal name",
  },
  {
    autoComplete: "tel",
    label: "Phone",
    name: "phone",
    placeholder: "Mobile number",
    type: "tel",
  },
  {
    autoComplete: "tel-national",
    label: "Office phone",
    name: "tel",
    placeholder: "Office / landline",
    type: "tel",
  },
];

const emailPattern = {
  message: "Enter a valid email address.",
  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

/** The business side of a document's sender block — the same details kept for a client. */
const businessFields: ProfileField[] = [
  {
    autoComplete: "organization",
    label: "Company name",
    name: "companyName",
    placeholder: "Your company",
  },
  {
    autoComplete: "off",
    label: "Business registration number (BRN)",
    name: "brn",
    placeholder: "e.g. C12345678",
  },
  {
    autoComplete: "email",
    label: "Business email",
    name: "businessEmail",
    pattern: emailPattern,
    placeholder: "hello@yourcompany.com",
    type: "email",
  },
  {
    autoComplete: "url",
    label: "Website",
    name: "website",
    placeholder: "yourcompany.com",
  },
  {
    autoComplete: "street-address",
    label: "Business address",
    name: "address",
    placeholder: "Street, city, postal code",
    wide: true,
  },
];

/**
 * Settings → My profile: who the account is, then the personal and business
 * details, each in its own card with its own Edit button.
 */
export const ProfileSettings = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="profile-settings grid gap-4">
      <ProfileOverviewCard user={user} />
      <ProfileDetailsCard
        description="Your name and phone are filled into every new document."
        fields={personalFields}
        icon={IdentificationCardIcon}
        readOnlyDetails={[{ label: "Email address", value: user?.email }]}
        title="Personal information"
        tone="blue"
      />
      <ProfileDetailsCard
        description="Kept like a client record. Your company, business email and address are filled into every new document."
        fields={businessFields}
        icon={BuildingsIcon}
        title="Business details"
        tone="teal"
      />
    </div>
  );
};
