import { BellIcon, ListIcon } from "@phosphor-icons/react";

import { Button } from "@/components/button/button";
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
        <Button
          aria-label="Open navigation"
          className="btn-circle border-transparent  text-app-chrome-content hover:bg-app-nav-hover lg:hidden"
          icon={null}
          onClick={onOpenNavigation}
          variant="ghost"
        >
          <ListIcon aria-hidden size={16} weight="bold" />
        </Button>
        <h1 className="truncate font-title text-2xl font-bold leading-tight text-app-chrome-content sm:text-3xl">
          {title}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <Button
          aria-label="Notifications"
          className="btn-circle border-transparent bg-app-control text-app-chrome-content hover:bg-app-nav-hover"
          icon={null}
          variant="ghost"
        >
          <BellIcon aria-hidden size={18} weight="bold" />
        </Button>

        <UserDropdown userInitials={userInitials} userName={userName} />
      </div>
    </header>
  );
};
