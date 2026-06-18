import { CaretDown, CaretDownIcon } from "@phosphor-icons/react";

import { Dropdown } from "@/components/dropdown/dropdown";

export type UserDropdownProps = {
  userName?: string;
  userInitials?: string;
};

export const UserDropdown = ({
  userInitials = "AA",
  userName = "Anthony Alverizko",
}: UserDropdownProps) => {
  return (
    <Dropdown
      ariaLabel="User menu"
      buttonClassName="btn h-12 min-h-0 gap-3 rounded-full border-transparent bg-app-control px-2 text-app-chrome-content shadow-none hover:bg-app-nav-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-active"
      menuClassName="mt-3 w-52 rounded-box bg-base-100 p-2 shadow-soft"
      trigger={
        <>
          <div className="flex size-9 items-center justify-center rounded-full bg-app-brand font-title text-xs font-bold text-app-brand-content">
            {userInitials}
          </div>
          <span className="hidden max-w-40 truncate text-left font-title text-sm font-bold sm:block">
            {userName}
          </span>
          <CaretDownIcon aria-hidden size={16} weight="bold" className="hidden sm:block" />
        </>
      }
    >
      <ul className="menu p-0">
        <li>
          <a>Profile</a>
        </li>
        <li>
          <a>Account settings</a>
        </li>
      </ul>
    </Dropdown>
  );
};
