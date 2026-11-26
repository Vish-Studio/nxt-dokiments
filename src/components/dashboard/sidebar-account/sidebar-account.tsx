"use client";

import { SignOutIcon } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import type { FunctionComponent } from "react";

import { Avatar } from "@/components/commons/avatar/avatar";
import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { InstallAppButton } from "@/components/commons/install-app-button/install-app-button";
import { signOutAndRedirect } from "@/lib/auth/sign-out";
import { iconSize } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

interface Props {
  isCollapsed?: boolean;
}

const logOutClassName =
  "shrink-0 border-none text-app-nav hover:bg-red-500/15 hover:text-red-300";

/**
 * The signed-in user at the foot of the sidebar: one quiet row with the
 * avatar, name and email, and a small log-out icon button at its end.
 *
 * - **Install app** sits above it as a plain sidebar row, and only when this
 *   browser can install the app (`InstallAppButton` renders nothing
 *   otherwise).
 * - **Collapsed (desktop):** the avatar, named by its `title`, above the
 *   log-out icon.
 *
 * Log out is an icon, not a red full-width button: it is rarely used, so it
 * should not be the loudest thing in the sidebar. It still turns red on hover
 * and carries an accessible name.
 */
const SidebarAccount: FunctionComponent<Props> = ({ isCollapsed = false }) => {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const queryClient = useQueryClient();

  const name = user?.displayName ?? "Dokiments User";

  const handleSignOut = () => signOutAndRedirect(queryClient, clearSession);

  const logOutIcon = (
    <SignOutIcon
      aria-hidden
      size={iconSize.control}
      weight="bold"
    />
  );

  return (
    <div className="sidebar-account min-w-0">
      <div className={cn(isCollapsed && "lg:hidden")}>
        {/*
          `ghost` brings no colour utilities of its own, so the sidebar row
          colours below win regardless of stylesheet order.
        */}
        <InstallAppButton
          className="mb-2 h-10! min-h-0! w-full justify-start! gap-3 rounded-lg border-0 px-3! font-title text-sm! font-semibold text-app-nav hover:bg-app-nav-hover hover:text-app-chrome-content"
          surface="sidebar"
          variant="ghost"
        />

        <div className="flex items-center gap-3 border-t border-white/10 pt-3">
          <Avatar
            className="shrink-0 bg-white/70 text-app-brand-content"
            name={user?.displayName}
          />

          <div className="min-w-0 flex-1">
            <p className="truncate font-title text-sm font-bold text-app-chrome-content">
              {name}
            </p>
            {user?.email ? (
              <p className="truncate text-xs text-app-nav">{user.email}</p>
            ) : null}
          </div>

          <ButtonIcon
            aria-label="Log out"
            className={logOutClassName}
            icon={logOutIcon}
            onClick={handleSignOut}
            size="sm"
            title="Log out"
            variant="ghost"
          />
        </div>
      </div>

      {isCollapsed ? (
        <div className="hidden flex-col items-center gap-2 border-t border-white/10 pt-3 lg:flex">
          <span title={name}>
            <Avatar
              className="bg-white/70 text-app-brand-content"
              name={user?.displayName}
            />
          </span>
          <ButtonIcon
            aria-label="Log out"
            className={logOutClassName}
            icon={logOutIcon}
            onClick={handleSignOut}
            size="sm"
            title="Log out"
            variant="ghost"
          />
        </div>
      ) : null}
    </div>
  );
};

SidebarAccount.displayName = "SidebarAccount";
export default SidebarAccount;
