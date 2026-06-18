import { Bell, CaretDown, List } from "@phosphor-icons/react";

import { Button } from "@/components/button/button";

export type TopbarProps = {
  greeting?: string;
  description?: string;
  userName?: string;
  userEmail?: string;
  userInitials?: string;
  onOpenNavigation?: () => void;
};

export function Topbar({
  description = "Here's your overview of your documents.",
  greeting = "Hello, Anthony!",
  onOpenNavigation,
  userEmail = "anthony.alve@gmail.com",
  userInitials = "AA",
  userName = "Anthony Alverizko",
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex flex-col gap-5 bg-background px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            aria-label="Open navigation"
            className="btn-circle border-transparent bg-base-200 text-nox-noir hover:bg-steel-mist lg:hidden"
            icon={null}
            onClick={onOpenNavigation}
            variant="ghost"
          >
            <List aria-hidden size={19} weight="bold" />
          </Button>
          <h1 className="truncate font-title text-3xl font-bold leading-tight text-bloodwood-deep sm:text-4xl">
            {greeting}
          </h1>
        </div>
        <p className="mt-2 text-base text-nox-noir/65">{description}</p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <Button
          aria-label="Notifications"
          className="btn-circle border-transparent bg-base-200 text-nox-noir hover:bg-steel-mist"
          icon={null}
          variant="ghost"
        >
          <Bell aria-hidden size={20} weight="bold" />
        </Button>

        <details className="dropdown dropdown-end">
          <summary className="btn h-auto min-h-0 gap-3 border-transparent bg-transparent px-0 py-0 hover:bg-transparent">
            <div className="flex size-12 items-center justify-center rounded-box bg-bloodwood-deep font-title text-sm font-bold text-golden-harvest">
              {userInitials}
            </div>
            <span className="hidden text-left sm:block">
              <span className="block font-title text-sm font-bold text-nox-noir">
                {userName}
              </span>
              <span className="block text-sm font-normal text-nox-noir/60">
                {userEmail}
              </span>
            </span>
            <CaretDown aria-hidden size={16} weight="bold" />
          </summary>
          <ul className="menu dropdown-content z-10 mt-3 w-52 rounded-box border border-steel-mist bg-base-100 p-2 shadow-soft">
            <li>
              <a>Profile</a>
            </li>
            <li>
              <a>Account settings</a>
            </li>
          </ul>
        </details>
      </div>
    </header>
  );
}
