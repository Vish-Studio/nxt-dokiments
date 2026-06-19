"use client";

import { CaretDownIcon, GearSixIcon, SignOutIcon, UserIcon } from "@phosphor-icons/react";
import Link from "next/link";

import { Dropdown } from "@/components/dropdown/dropdown";
import { useAuthStore } from "@/stores/auth-store";

export type UserDropdownProps = {
  userName?: string;
  userInitials?: string;
};

const itemClassName =
  "flex w-full items-center gap-2.5 rounded-box px-3 py-2 text-left text-sm font-medium text-nox-noir transition-colors hover:bg-base-200";

export const UserDropdown = ({ userName = "Anthony Alverizko" }: UserDropdownProps) => {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleSignOut = () => {
    clearSession();
    window.location.assign("/sign-in");
  };

  return (
    <Dropdown
      ariaLabel="User menu"
      buttonClassName="btn h-12 min-h-0 gap-3 rounded-full border-transparent bg-app-control px-2 text-app-chrome-content shadow-none hover:bg-app-nav-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-active"
      menuClassName="mt-3 w-60 rounded-box border border-steel-mist bg-base-100 p-2 text-nox-noir"
      trigger={
        <>
          <span className="flex size-8 items-center justify-center rounded-full bg-white/70 text-app-brand-content">
            <UserIcon aria-hidden size={16} weight="bold" />
          </span>
          <span className="hidden max-w-40 truncate text-left font-title text-sm font-semibold sm:block">
            {userName}
          </span>
          <CaretDownIcon aria-hidden size={16} weight="bold" className="hidden sm:block" />
        </>
      }
    >
      <div className="border-b border-steel-mist px-3 pb-3 pt-2">
        <p className="truncate font-title text-sm font-bold text-nox-noir">{userName}</p>
        {user?.email ? (
          <p className="truncate text-xs text-nox-noir/55">{user.email}</p>
        ) : null}
      </div>
      <ul className="grid gap-1 pt-2">
        <li>
          <Link className={itemClassName} href="/settings">
            <UserIcon aria-hidden size={16} weight="bold" />
            Profile
          </Link>
        </li>
        <li>
          <Link className={itemClassName} href="/settings">
            <GearSixIcon aria-hidden size={16} weight="bold" />
            Account settings
          </Link>
        </li>
        <li>
          <button
            className="flex w-full items-center gap-2.5 rounded-box px-3 py-2 text-left text-sm font-medium text-error transition-colors hover:bg-error/10"
            onClick={handleSignOut}
            type="button"
          >
            <SignOutIcon aria-hidden size={16} weight="bold" />
            Sign out
          </button>
        </li>
      </ul>
    </Dropdown>
  );
};
