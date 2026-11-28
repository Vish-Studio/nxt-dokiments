import { FlaskIcon } from "@phosphor-icons/react/dist/ssr";

import { iconSize } from "@/lib/icons";

export interface AdminSampleNoticeProps {
  /** Why the data is not real yet, in one short sentence ("Nothing records admin actions yet."). */
  reason: string;
}

/**
 * Says plainly that a page (or a card) shows sample data, so nobody acts on
 * made-up numbers. Shown wherever `src/lib/admin/<area>/dummy-data.ts` feeds
 * the screen, and removed when that area moves to Firestore.
 */
export const AdminSampleNotice = ({ reason }: AdminSampleNoticeProps) => (
  <p
    className="admin-sample-notice flex items-start gap-3 rounded-box border border-dashed border-steel-mist bg-base-200/60 px-4 py-3 text-sm leading-6 text-nox-noir/75"
    role="note"
  >
    <span className="mt-0.5 inline-flex shrink-0 items-center gap-1.5 rounded-field bg-golden-harvest px-2 py-0.5 font-title text-xs font-bold text-nox-noir">
      <FlaskIcon
        aria-hidden
        size={iconSize.inline}
        weight="bold"
      />
      Sample data
    </span>
    <span>{reason}</span>
  </p>
);

export default AdminSampleNotice;
