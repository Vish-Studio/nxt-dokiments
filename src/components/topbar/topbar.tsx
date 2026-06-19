import { BellIcon, ListIcon } from "@phosphor-icons/react";

import { ButtonIcon } from "@/components/button-icon/button-icon";
import { UserDropdown } from "@/components/user-dropdown/user-dropdown";

export type TopbarProps = {
  title?: string;
  userName?: string;
  userInitials?: string;
  onOpenNavigation?: () => void;
};

export const Topbar = ({
  onOpenNavigation,
  title = "Dashboard",
  userInitials = "AA",
  userName = "Anthony Alverizko",
}: TopbarProps) => {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 bg-app-chrome px-2 py-2 sm:px-4 lg:py-8 lg:pb-4 text-app-chrome-content ">
      <div className="flex min-w-0 items-center gap-3">
        <ButtonIcon
          aria-label="Open navigation"
          className="border-transparent text-app-chrome-content hover:bg-app-nav-hover lg:hidden"
          icon={<ListIcon aria-hidden size={16} weight="bold" />}
          onClick={onOpenNavigation}
          variant="ghost"
        />
        <h1 className="truncate font-title text-2xl font-bold leading-tight text-app-chrome-content sm:text-3xl">
          {title}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <ButtonIcon
          aria-label="Notifications"
          className="border-transparent bg-app-control text-app-chrome-content hover:bg-app-nav-hover"
          icon={<BellIcon aria-hidden size={18} weight="bold" />}
          variant="ghost"
        />

        <UserDropdown userInitials={userInitials} userName={userName} />
      </div>
    </header>
  );
};
