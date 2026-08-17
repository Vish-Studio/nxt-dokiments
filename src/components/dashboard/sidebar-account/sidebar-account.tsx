"use client";

import { SignOutIcon } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import type { FunctionComponent } from "react";

import { Avatar } from "@/components/commons/avatar/avatar";
import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { queryKeys } from "@/lib/query/keys";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

interface Props {
  isCollapsed?: boolean;
}

const SidebarAccount: FunctionComponent<Props> = ({ isCollapsed = false }) => {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const queryClient = useQueryClient();

  const name = user?.displayName ?? "Dokiments User";

  const handleSignOut = async () => {
    await fetch("/api/auth/sign-out", { method: "POST" });
    queryClient.setQueryData(queryKeys.session(), null);
    clearSession();
    window.location.assign("/sign-in");
  };

  return (
    <div className="sidebar-account min-w-0">
      <div
        className={cn(
          "rounded-box border border-white/10 bg-app-control p-3",
          isCollapsed && "lg:hidden",
        )}
      >
        <div className="flex items-center gap-3">
          <Avatar
            className="bg-white/70 text-app-brand-content"
            name={user?.displayName}
          />

          <div className="min-w-0">
            <p className="truncate font-title text-sm font-bold text-app-chrome-content">
              {name}
            </p>
            {user?.email ? (
              <p className="truncate text-xs text-app-nav">{user.email}</p>
            ) : null}
          </div>
        </div>
        <button
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-app-nav-hover px-3 py-2 font-title text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/15 hover:text-red-300"
          onClick={handleSignOut}
          type="button"
        >
          <SignOutIcon
            aria-hidden
            size={15}
            weight="bold"
          />
          Log out
        </button>
      </div>

      {isCollapsed ? (
        <div className="hidden flex-col items-center gap-2 lg:flex">
          <ButtonIcon
            aria-label="Log out"
            className="border-none text-red-400 hover:bg-red-500/15 hover:text-red-300"
            icon={
              <SignOutIcon
                aria-hidden
                size={16}
                weight="bold"
              />
            }
            onClick={handleSignOut}
            size="sm"
            variant="ghost"
          />
        </div>
      ) : null}
    </div>
  );
};

SidebarAccount.displayName = "SidebarAccount";
export default SidebarAccount;
