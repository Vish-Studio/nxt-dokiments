import { UserIcon } from "@phosphor-icons/react";
import Image from "next/image";

import { cn, getInitials } from "@/lib/utils";

export type AvatarSize = "sm" | "lg";

export type AvatarProps = {
  className?: string;
  /** Signed-in user's display name, used to derive initials when `imageUrl` is absent. `null`/`undefined` renders the `UserIcon` fallback (no user yet). */
  name?: string | null;
  /** Profile picture URL. Takes priority over initials when present. */
  imageUrl?: string | null;
  size?: AvatarSize;
};

const sizeClasses: Record<AvatarSize, string> = {
  sm: "size-8 text-xs",
  lg: "size-14 text-lg",
};

const iconSizes: Record<AvatarSize, number> = {
  sm: 16,
  lg: 24,
};

/**
 * Renders a user's avatar with a three-way fallback: `imageUrl` -> initials
 * derived from `name` -> a generic `UserIcon` when there's no user at all
 * (e.g. session still loading). Used by `sidebar-account.tsx` and
 * `profile-summary.tsx` — colors are left to the caller via `className`
 * since each consumer uses a different background/text pairing.
 */
export const Avatar = ({
  className,
  imageUrl,
  name,
  size = "sm",
}: AvatarProps) => {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full font-title font-bold",
        sizeClasses[size],
        className,
      )}
    >
      {imageUrl ? (
        <Image
          alt={name ? `${name}'s avatar` : "User avatar"}
          className="size-full object-cover"
          height={56}
          src={imageUrl}
          width={56}
        />
      ) : name ? (
        getInitials(name)
      ) : (
        <UserIcon
          aria-hidden
          size={iconSizes[size]}
          weight="bold"
        />
      )}
    </span>
  );
};
