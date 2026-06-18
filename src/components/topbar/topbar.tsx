import { Bell, List } from "@phosphor-icons/react";

import { Button } from "@/components/button/button";
import { UserDropdown } from "@/components/user-dropdown/user-dropdown";

export type TopbarProps = {
  title?: string;
  userName?: string;
  userInitials?: string;
  onOpenNavigation?: () => void;
};

export function Topbar({
  onOpenNavigation,
  title = "Dashboard",
  userInitials = "AA",
  userName = "Anthony Alverizko",
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 bg-nox-noir px-5 py-7 pb-4 text-white sm:px-8 lg:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          aria-label="Open navigation"
          className="btn-circle border-transparent bg-white/10 text-white hover:bg-white/15 lg:hidden"
          icon={null}
          onClick={onOpenNavigation}
          variant="ghost"
        >
          <List aria-hidden size={19} weight="bold" />
        </Button>
        <h1 className="truncate font-title text-2xl font-bold leading-tight text-white sm:text-3xl">
          {title}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <Button
          aria-label="Notifications"
          className="btn-circle border-transparent bg-white/10 text-white hover:bg-white/15"
          icon={null}
          variant="ghost"
        >
          <Bell aria-hidden size={20} weight="bold" />
        </Button>

        <UserDropdown userInitials={userInitials} userName={userName} />
      </div>
    </header>
  );
}
