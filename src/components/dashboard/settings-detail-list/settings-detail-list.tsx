import { cn } from "@/lib/utils";

export interface SettingsDetail {
  label: string;
  value?: string;
  /** Spans both columns, for long values such as an address. */
  wide?: boolean;
}

export interface SettingsDetailListProps {
  details: SettingsDetail[];
}

/**
 * Read-only label/value pairs in a two-column grid (one column on mobile), as on
 * a printed form. Empty values read "Not set" so a blank never looks like a
 * loading glitch.
 */
export const SettingsDetailList = ({ details }: SettingsDetailListProps) => (
  <dl className="settings-detail-list grid gap-x-8 gap-y-5 sm:grid-cols-2">
    {details.map((detail) => (
      <div
        className={cn("grid min-w-0 gap-1", detail.wide && "sm:col-span-2")}
        key={detail.label}
      >
        <dt className="text-xs font-semibold text-nox-noir/50">
          {detail.label}
        </dt>
        <dd
          className={cn(
            "break-words text-sm",
            detail.value
              ? "font-medium text-nox-noir"
              : "italic text-nox-noir/40",
          )}
        >
          {detail.value || "Not set"}
        </dd>
      </div>
    ))}
  </dl>
);

export default SettingsDetailList;
