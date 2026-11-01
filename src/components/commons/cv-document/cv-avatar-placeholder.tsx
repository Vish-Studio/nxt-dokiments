"use client";

import { UserIcon } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  isCompact: boolean;
}

// Stands in for the profile photo until photo uploads are supported.
export const CvAvatarPlaceholder = ({ className, isCompact }: Props) => (
  <div
    aria-hidden
    className={cn(
      "cv-avatar-placeholder flex shrink-0 items-center justify-center rounded-full",
      isCompact ? "size-14" : "size-24",
      className,
    )}
  >
    <UserIcon
      className={isCompact ? "size-7" : "size-12"}
      weight="fill"
    />
  </div>
);

export default CvAvatarPlaceholder;
