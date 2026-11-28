import { type AdminStatusTone, statusToneClassNames } from "@/lib/admin/status-tone";
import { cn } from "@/lib/utils";

export interface AdminStatusPillProps {
  /** The status in words; a pill never relies on colour alone. */
  label: string;
  tone: AdminStatusTone;
}

/**
 * A small status pill for admin lists ("Signed", "Pending", "Expired").
 *
 * The same shape and sizes as the app's `EntryStatusPill`, with a tone instead
 * of a fixed status list, because each admin area has its own statuses.
 */
export const AdminStatusPill = ({ label, tone }: AdminStatusPillProps) => (
  <span
    className={cn(
      "admin-status-pill inline-flex h-6 shrink-0 items-center rounded-field px-2 text-xs font-semibold whitespace-nowrap",
      statusToneClassNames[tone],
    )}
  >
    {label}
  </span>
);

export default AdminStatusPill;
