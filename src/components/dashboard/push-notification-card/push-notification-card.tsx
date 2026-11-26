import { BellRingingIcon } from "@phosphor-icons/react";

import { Badge } from "@/components/commons/badge/badge";
import { Button } from "@/components/commons/button/button";
import { LoadingStatus } from "@/components/commons/loading-status/loading-status";
import { SettingsCard } from "@/components/dashboard/settings-card/settings-card";
import type { PushStatus } from "@/hooks/use-push-notifications";

export interface PushNotificationCardProps {
  /** Where this device stands. See {@link PushStatus} for what each value means. */
  status: PushStatus;
  /** A subscribe request is in flight. Disables and relabels "Turn on". */
  isEnabling?: boolean;
  /** An unsubscribe request is in flight. Disables and relabels "Turn off". */
  isDisabling?: boolean;
  /** A test push is being sent. Disables and relabels "Send test notification". */
  isSendingTest?: boolean;
  /** Asks for permission and subscribes this device. Must run from a click. */
  onEnable: () => void;
  /** Unsubscribes this device. */
  onDisable: () => void;
  /** Sends a test push to the user's subscribed devices. */
  onSendTest: () => void;
}

/** Explains why the toggle is unavailable, so the card never shows a dead control. */
const unavailableCopy: Partial<Record<PushStatus, string>> = {
  blocked:
    "Notifications are blocked for Dokiments in this browser. Allow them in your browser's site settings, then come back to turn them on.",
  "install-required":
    "On iPhone and iPad, notifications work once Dokiments is added to your Home Screen. Tap Share, choose Add to Home Screen, then open Dokiments from there and return to this page.",
  unsupported:
    "This browser doesn't support push notifications. You'll still see everything in the bell at the top of the page.",
};

/**
 * The Settings → Notifications card: opt in or out of push notifications on
 * this device, and send a test.
 *
 * Presentational only; {@link PushNotificationSettings} owns the browser and
 * network state. Notifications are per device, so the copy says so.
 */
export const PushNotificationCard = ({
  isDisabling = false,
  isEnabling = false,
  isSendingTest = false,
  onDisable,
  onEnable,
  onSendTest,
  status,
}: PushNotificationCardProps) => (
  <SettingsCard
    action={status === "on" ? <Badge variant="success">On</Badge> : undefined}
    className="push-notification-card"
    description="Get an alert on this device even when Dokiments is closed."
    icon={BellRingingIcon}
    title="Push notifications"
  >
    <div className="mt-4">
      {status === "loading" ? (
        <>
          <LoadingStatus message="Checking notification support…" />
          <div
            aria-hidden
            className="skeleton h-11 w-48 rounded-field"
          />
        </>
      ) : null}

      {unavailableCopy[status] ? (
        <p className="text-sm leading-6 text-nox-noir/70">
          {unavailableCopy[status]}
        </p>
      ) : null}

      {status === "off" ? (
        <div className="grid gap-3">
          <p className="text-sm leading-6 text-nox-noir/70">
            Your browser will ask for permission. This only applies to this
            device; turn it on separately on each phone or computer you use.
          </p>
          <div>
            <Button
              disabled={isEnabling}
              onClick={onEnable}
            >
              {isEnabling ? "Turning on…" : "Turn on notifications"}
            </Button>
          </div>
        </div>
      ) : null}

      {status === "on" ? (
        <div className="grid gap-3">
          <p className="text-sm leading-6 text-nox-noir/70">
            Notifications are on for this device. Turn them off here at any
            time.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              disabled={isSendingTest || isDisabling}
              onClick={onSendTest}
              variant="outline"
            >
              {isSendingTest ? "Sending…" : "Send test notification"}
            </Button>
            <Button
              disabled={isDisabling || isSendingTest}
              onClick={onDisable}
              variant="ghost"
            >
              {isDisabling ? "Turning off…" : "Turn off"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  </SettingsCard>
);
