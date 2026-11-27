import { StatusPill } from "@/components/commons/status-pill/status-pill";
import type { StatusTone } from "@/lib/ui/status-tone";
import type { ShareRecipientStatus } from "@/types/sharing";

export interface ShareStatusBadgeProps {
  /**
   * `false` for a view-only share. Nothing is waiting on a signature there, so
   * `pending` reads "Not opened" instead of "Pending".
   */
  signable?: boolean;
  /** The recipient's progress: pending, viewed, signed or revoked. */
  status: ShareRecipientStatus;
}

const statusDisplay: Record<
  ShareRecipientStatus,
  { label: string; tone: StatusTone }
> = {
  pending: { label: "Pending", tone: "golden" },
  revoked: { label: "Revoked", tone: "grey" },
  signed: { label: "Signed", tone: "green" },
  viewed: { label: "Viewed", tone: "blue" },
};

/**
 * A recipient's progress on a shared document, as a dot + word `StatusPill`
 * in the same colours as the document lists: Pending golden (grey "Not
 * opened" for a view-only share), Viewed blue, Signed green, Revoked grey.
 */
export const ShareStatusBadge = ({
  signable = true,
  status,
}: ShareStatusBadgeProps) => {
  const { label: defaultLabel, tone: defaultTone } = statusDisplay[status];
  const isNotOpened = !signable && status === "pending";

  return (
    <StatusPill tone={isNotOpened ? "grey" : defaultTone}>
      {isNotOpened ? "Not opened" : defaultLabel}
    </StatusPill>
  );
};
