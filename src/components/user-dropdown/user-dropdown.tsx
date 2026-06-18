import { CaretDown } from "@phosphor-icons/react";

import { Dropdown } from "@/components/dropdown/dropdown";

export type UserDropdownProps = {
  userName?: string;
  userInitials?: string;
};

export function UserDropdown({
  userInitials = "AA",
  userName = "Anthony Alverizko",
}: UserDropdownProps) {
  return (
    <Dropdown
      ariaLabel="User menu"
      buttonClassName="btn h-12 min-h-0 gap-3 rounded-full border-transparent bg-base-200 px-3 text-nox-noir shadow-none hover:bg-steel-mist"
      menuClassName="mt-3 w-52 rounded-box bg-base-100 p-2 shadow-soft"
      trigger={
        <>
          <div className="flex size-9 items-center justify-center rounded-full bg-bloodwood-deep font-title text-xs font-bold text-golden-harvest">
            {userInitials}
          </div>
          <span className="hidden max-w-40 truncate text-left font-title text-sm font-bold sm:block">
            {userName}
          </span>
          <CaretDown aria-hidden size={16} weight="bold" />
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
}
