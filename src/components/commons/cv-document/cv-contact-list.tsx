"use client";

import {
  EnvelopeSimpleIcon,
  GlobeSimpleIcon,
  MapPinIcon,
  PhoneIcon,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

interface Props {
  className: string;
  isCompact: boolean;
  values: Record<string, string>;
}

const contacts: { icon: Icon; key: string }[] = [
  { icon: EnvelopeSimpleIcon, key: "email" },
  { icon: PhoneIcon, key: "phone" },
  { icon: MapPinIcon, key: "location" },
  { icon: GlobeSimpleIcon, key: "website" },
];

export const CvContactList = ({ className, isCompact, values }: Props) => {
  const items = contacts.filter(({ key }) => values[key]?.trim());
  if (!items.length) return null;

  return (
    <ul
      className={cn(
        "cv-contact-list mt-3 flex flex-wrap gap-x-4 gap-y-1",
        isCompact ? "text-[11px]" : "text-xs",
        className,
      )}
    >
      {items.map(({ icon: ContactIcon, key }) => (
        <li
          className="flex min-w-0 items-center gap-1.5"
          key={key}
        >
          <ContactIcon
            aria-hidden
            className="shrink-0"
            size={14}
          />
          <span className="break-all">{values[key].trim()}</span>
        </li>
      ))}
    </ul>
  );
};

export default CvContactList;
