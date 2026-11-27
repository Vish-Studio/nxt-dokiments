"use client";

import { MagnifyingGlassIcon, StorefrontIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { type KeyboardEvent, useMemo, useRef, useState } from "react";

import { Button } from "@/components/commons/button/button";
import { EmptyState } from "@/components/commons/empty-state/empty-state";
import { desktopMediaQuery } from "@/hooks/use-media-query";
import {
  buildTemplatePickerGroups,
  formatTemplateLastUsed,
} from "@/lib/documents/template-picker";
import {
  getDocumentTypeLabel,
  sortDocumentTypes,
} from "@/lib/market-place/document-labels";
import { iconSize } from "@/lib/icons";
import type { DocumentType, MarketplaceTemplate } from "@/types/template";

import { TemplatePickerContextChip } from "./template-picker-context-chip";
import { TemplatePickerFilters } from "./template-picker-filters";
import { TemplatePickerPreview } from "./template-picker-preview";
import { TemplatePickerRow } from "./template-picker-row";

export interface TemplatePickerProps {
  /**
   * Who the new document is for, when the user started from a company page.
   * Shown as a "For: …" chip; omit for a document with no client yet.
   */
  contextLabel?: string;
  /** Epoch ms each template last started a document, keyed by template id. */
  lastUsed?: Record<string, number>;
  /** Clears {@link TemplatePickerProps.contextLabel} and its prefill. */
  onClearContext?: () => void;
  /** Opens the full-size preview dialog for a template. */
  onPreview: (template: MarketplaceTemplate) => void;
  /** Starts a new document from a template (opens the editor). */
  onUse: (template: MarketplaceTemplate) => void;
  /** The user's saved templates. Must not be empty: the caller shows its own empty state. */
  templates: readonly MarketplaceTemplate[];
}

/**
 * Step one of a new document: pick one of the user's saved templates.
 *
 * Desktop is a split view: a searchable list grouped by type on the left, and
 * a live preview of the selected template with "Use this template" on the
 * right. ↑/↓ move the selection, Enter uses it. Phones show the list only, and
 * a tap starts the document straight away, so there is no extra step.
 *
 * @example
 * <TemplatePicker templates={owned} lastUsed={lastUsed} onUse={startNewDocument} onPreview={setPreviewTemplate} />
 */
export const TemplatePicker = ({
  contextLabel,
  lastUsed = {},
  onClearContext,
  onPreview,
  onUse,
  templates,
}: TemplatePickerProps) => {
  const [search, setSearch] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const rowRefs = useRef(new Map<string, HTMLButtonElement>());

  const documentTypes = useMemo(
    () =>
      sortDocumentTypes([
        ...new Set(templates.map((template) => template.documentType)),
      ]),
    [templates],
  );
  const groups = buildTemplatePickerGroups(
    templates,
    { documentType, search },
    lastUsed,
  );
  const visible = groups.flatMap((group) => group.templates);
  // Falls back to the first visible row when the selection is filtered out.
  const selected =
    visible.find((template) => template.id === selectedId) ?? visible[0];

  const activate = (template: MarketplaceTemplate) => {
    if (window.matchMedia(desktopMediaQuery).matches) {
      setSelectedId(template.id);
    } else {
      onUse(template);
    }
  };

  const handleRowKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    template: MarketplaceTemplate,
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onUse(template);
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    event.preventDefault();
    const index = visible.findIndex((item) => item.id === template.id);
    const next = visible[index + (event.key === "ArrowDown" ? 1 : -1)];
    if (!next) return;

    setSelectedId(next.id);
    rowRefs.current.get(next.id)?.focus();
  };

  const resetFilters = () => {
    setSearch("");
    setDocumentType("all");
  };

  // Desktop: one fixed-height row, so the list card and the preview end on
  // the same line; the list scrolls inside its card.
  return (
    <div className="template-picker grid w-full gap-4 lg:h-[calc(100dvh-13rem)] lg:min-h-[32rem] lg:grid-cols-[22rem_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-4 lg:min-h-0 lg:overflow-hidden lg:rounded-box lg:border lg:border-steel-mist lg:bg-base-100 lg:p-4">
        {/* Says what to do here in one line, so nobody wonders whether a
            click starts the document or only shows it. */}
        <div>
          <h2 className="font-title text-lg font-bold text-nox-noir">
            Choose your available templates
          </h2>
          <p className="mt-0.5 text-sm leading-5 text-nox-noir/65">
            <span className="lg:hidden">Tap one to start your document.</span>
            <span className="hidden lg:inline">
              Pick one to preview it, then use it to start.
            </span>
          </p>
        </div>
        {contextLabel && onClearContext ? (
          <TemplatePickerContextChip
            label={contextLabel}
            onClear={onClearContext}
          />
        ) : null}
        <TemplatePickerFilters
          documentType={documentType}
          documentTypes={documentTypes}
          onDocumentType={setDocumentType}
          onSearch={setSearch}
          search={search}
        />

        {groups.length === 0 ? (
          <EmptyState
            action={
              <Button
                onClick={resetFilters}
                size="sm"
                variant="outline"
              >
                Clear filters
              </Button>
            }
            className="min-h-60"
            description="Try another search, or clear the filters to see all your templates."
            icon={
              <MagnifyingGlassIcon
                aria-hidden
                size={iconSize.feature}
                weight="bold"
              />
            }
            title="No templates match"
          />
        ) : (
          <div className="-mx-4 grid content-start gap-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            {groups.map((group) => {
              const label = getDocumentTypeLabel(group.documentType);

              return (
                <section
                  aria-label={`${label} templates`}
                  key={group.documentType}
                >
                  <h3 className="px-4 pb-1.5 font-title text-xs font-bold tracking-wider text-nox-noir/60 uppercase">
                    {label} · {group.templates.length}
                  </h3>
                  <ul className="divide-y divide-steel-mist/50 border-y border-steel-mist/70 bg-base-100">
                    {group.templates.map((template) => (
                      <li key={template.id}>
                        <TemplatePickerRow
                          caption={`${template.style.name} · ${formatTemplateLastUsed(lastUsed[template.id])}`}
                          isSelected={template.id === selected?.id}
                          onActivate={() => activate(template)}
                          onUse={() => onUse(template)}
                          onKeyDown={(event) =>
                            handleRowKeyDown(event, template)
                          }
                          ref={(node) => {
                            if (node) rowRefs.current.set(template.id, node);
                            else rowRefs.current.delete(template.id);
                          }}
                          template={template}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}

        <Link
          className="flex shrink-0 items-center gap-3 rounded-field border border-dashed border-play-teal bg-play-teal/15 p-4 text-sm transition-colors hover:bg-play-teal/25 lg:mt-auto"
          href="/marketplace"
        >
          <StorefrontIcon
            aria-hidden
            className="shrink-0 text-nox-noir/70"
            size={iconSize.tile}
            weight="bold"
          />
          <span className="leading-5 text-nox-noir/75">
            Need another template?{" "}
            <span className="font-semibold text-nox-noir underline decoration-play-teal decoration-2 underline-offset-2">
              Browse marketplace
            </span>
          </span>
        </Link>
      </div>

      {selected ? (
        <div className="hidden lg:flex lg:min-h-0 lg:flex-col">
          <TemplatePickerPreview
            contextLabel={contextLabel}
            onPreview={() => onPreview(selected)}
            onUse={() => onUse(selected)}
            template={selected}
          />
        </div>
      ) : null}
    </div>
  );
};

export default TemplatePicker;
