import { cn } from "@/lib/utils";

export type ShareSuggestion = {
  email: string;
  /** Shown beside the address, e.g. a client's name. */
  name?: string;
};

export type ShareSuggestionSection = {
  /** Suggestions to offer, in display order. */
  items: readonly ShareSuggestion[];
  label: string;
};

export interface ShareRecipientSuggestionsProps {
  disabled?: boolean;
  onSelect: (email: string) => void;
  /** Sections in display order; an address appears only in the first section that has it. */
  sections: readonly ShareSuggestionSection[];
  /** The address currently typed, so a matching chip shows as chosen. */
  selected?: string;
}

/** The most suggestions shown overall, so a long list never crowds the dialog. */
const MAX_SUGGESTIONS = 5;

/** Chips grouped by where the address came from; one click fills the email field. */
export const ShareRecipientSuggestions = ({
  disabled = false,
  onSelect,
  sections,
  selected = "",
}: ShareRecipientSuggestionsProps) => {
  const seen = new Set<string>();
  const unique = sections.map((section) => ({
    items: section.items.filter((item) => {
      if (seen.has(item.email)) {
        return false;
      }

      seen.add(item.email);
      return true;
    }),
    label: section.label,
  }));
  const total = seen.size;
  const visible = unique
    .map((section, index) => {
      const before = unique
        .slice(0, index)
        .reduce((count, earlier) => count + earlier.items.length, 0);

      return {
        items: section.items.slice(0, Math.max(0, MAX_SUGGESTIONS - before)),
        label: section.label,
      };
    })
    .filter((section) => section.items.length > 0);
  const hidden = total - Math.min(total, MAX_SUGGESTIONS);

  if (visible.length === 0) {
    return null;
  }

  const normalisedSelected = selected.trim().toLowerCase();

  return (
    <div className="share-recipient-suggestions mt-3 space-y-3">
      {visible.map((section) => (
        <div key={section.label}>
          <p className="font-title text-xs font-semibold uppercase tracking-wide text-nox-noir/45">
            {section.label}
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {section.items.map(({ email, name }) => {
              const isSelected = email === normalisedSelected;

              return (
                <li key={email}>
                  <button
                    aria-pressed={isSelected}
                    className={cn(
                      "max-w-full truncate rounded-field border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nox-noir/30",
                      isSelected
                        ? "border-nox-noir bg-nox-noir text-white"
                        : "border-steel-mist bg-base-200 text-nox-noir hover:border-nox-noir",
                    )}
                    disabled={disabled}
                    onClick={() => onSelect(email)}
                    type="button"
                  >
                    {name ? (
                      <span className="mr-1.5 font-semibold">{name}</span>
                    ) : null}
                    <span className={name ? "opacity-70" : undefined}>
                      {email}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      {hidden > 0 ? (
        <p className="text-xs text-nox-noir/45">
          {hidden} more — keep typing to narrow the list.
        </p>
      ) : null}
    </div>
  );
};
