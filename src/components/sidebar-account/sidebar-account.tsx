"use client";

import { SignOutIcon, UserIcon } from "@phosphor-icons/react";

import { ButtonIcon } from "@/components/button-icon/button-icon";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export type SidebarAccountProps = {
  isCollapsed?: boolean;
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "DU";

export const SidebarAccount = ({ isCollapsed = false }: SidebarAccountProps) => {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const name = user?.displayName ?? "Dokiments User";
  const initials = getInitials(name);

  const handleSignOut = () => {
    clearSession();
    window.location.assign("/sign-in");
  };

  return (
    <div>
      <div
        className={cn(
          "rounded-box border border-white/10 bg-app-control p-3",
          isCollapsed && "lg:hidden",
        )}
      >
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-full bg-white/70 text-app-brand-content">
            <UserIcon aria-hidden size={16} weight="bold" />
          </span>

          <div className="min-w-0">
            <p className="truncate font-title text-sm font-bold text-app-chrome-content">{name}</p>
            {user?.email ? (
              <p className="truncate text-xs text-app-nav">{user.email}</p>
            ) : null}
          </div>
        </div>
        <button
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-app-nav-hover px-3 py-2 font-title text-xs font-semibold text-app-chrome-content transition-colors hover:bg-app-active hover:text-app-active-content"
          onClick={handleSignOut}
          type="button"
        >
          <SignOutIcon aria-hidden size={15} weight="bold" />
          Log out
        </button>
      </div>

      {isCollapsed ? (
        <div className="hidden flex-col items-center gap-2 lg:flex">
          {/* <span className="flex size-8 items-center justify-center rounded-full bg-white/70 text-app-brand-content">
            <UserIcon aria-hidden size={16} weight="bold" />
          </span> */}

          <ButtonIcon
            aria-label="Log out"
            className="border-none text-app-nav hover:bg-app-nav-hover hover:text-app-chrome-content"
            icon={<SignOutIcon aria-hidden size={16} weight="bold" />}
            onClick={handleSignOut}
            size="sm"
            variant="ghost"
          />
        </div>
      ) : null}
    </div>
  );
};
