import { UserIcon } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";
import type { AuthUser, UserRole } from "@/types/auth";

const roleLabels: Record<UserRole, string> = {
  free: "Free",
  gold: "Gold",
  silver: "Silver",
  special: "Special",
  superadmin: "Super admin",
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "DU";

export type ProfileSummaryProps = {
  user: AuthUser | null;
};

export const ProfileSummary = ({ user }: ProfileSummaryProps) => {
  const details: { label: string; value?: string }[] = [
    { label: "Full name", value: user?.fullName },
    { label: "Company", value: user?.companyName },
    { label: "Phone", value: user?.phone },
    { label: "Tel", value: user?.tel },
    { label: "Address", value: user?.address },
  ];

  return (
    <aside className="flex h-full flex-col rounded-box border border-steel-mist bg-base-100 p-6">
      <div className="flex items-center gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-bloodwood-deep font-title text-lg font-bold text-white">
          {user ? getInitials(user.displayName) : <UserIcon aria-hidden size={24} weight="bold" />}
        </span>
        <div className="min-w-0">
          <p className="truncate font-title text-lg font-bold text-nox-noir">
            {user?.displayName ?? "Your profile"}
          </p>
          <p className="truncate text-sm text-nox-noir/55">{user?.email ?? "—"}</p>
        </div>
      </div>

      <span className="mt-4 inline-flex w-fit items-center rounded-box bg-golden-harvest px-3 py-1 font-title text-xs font-bold text-bloodwood-deep">
        {user ? roleLabels[user.role] : "Free"} plan
      </span>

      <dl className="mt-6 grid gap-4 border-t border-steel-mist pt-6">
        {details.map((detail) => (
          <div className="grid gap-1" key={detail.label}>
            <dt className="font-title text-xs font-semibold uppercase tracking-wide text-nox-noir/45">
              {detail.label}
            </dt>
            <dd
              className={cn(
                "text-sm",
                detail.value ? "font-medium text-nox-noir" : "italic text-nox-noir/40",
              )}
            >
              {detail.value || "Not set"}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
};
