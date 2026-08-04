"use client";

import { Button } from "@/components/commons/button/button";
import { OPEN_COOKIE_SETTINGS_EVENT } from "@/lib/cookie-consent";
import { cn } from "@/lib/utils";

export interface CookieSettingsButtonProps {
  className?: string;
}

export const CookieSettingsButton = ({ className }: CookieSettingsButtonProps) => {
  return (
    <Button
      className={cn("cookie-settings-button", className)}
      onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))}
      size="sm"
      variant="ghost"
    >
      Cookie settings
    </Button>
  );
};
