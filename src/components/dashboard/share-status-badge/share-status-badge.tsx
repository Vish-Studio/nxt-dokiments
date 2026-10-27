import { Badge, type BadgeVariant } from "@/components/commons/badge/badge";
import type { ShareRecipientStatus } from "@/types/sharing";

export interface ShareStatusBadgeProps {
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
export const ShareStatusBadge = ({ status }: ShareStatusBadgeProps) => {
  const { label, variant } = statusDisplay[status];

  return <Badge variant={variant}>{label}</Badge>;
};
