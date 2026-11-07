import { Badge, type BadgeVariant } from "@/components/commons/badge/badge";
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
  { label: string; variant: BadgeVariant }
> = {
  pending: { label: "Pending", variant: "accent" },
  revoked: { label: "Revoked", variant: "neutral" },
  signed: { label: "Signed", variant: "success" },
  viewed: { label: "Viewed", variant: "neutral" },
};

/** A recipient's progress on a shared document. */
export const ShareStatusBadge = ({
  signable = true,
  status,
}: ShareStatusBadgeProps) => {
  const { label: defaultLabel, variant } = statusDisplay[status];
  const label = !signable && status === "pending" ? "Not opened" : defaultLabel;

  return <Badge variant={variant}>{label}</Badge>;
};
