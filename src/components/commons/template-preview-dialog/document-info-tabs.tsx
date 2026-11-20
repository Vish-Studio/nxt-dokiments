"use client";

import { FileTextIcon, LayoutIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { Badge } from "@/components/commons/badge/badge";
import { TabMenu } from "@/components/commons/tab-menu/tab-menu";
import type { DocumentDetail } from "@/lib/documents/document-details";
import { iconSize, navIconWeight } from "@/lib/icons";
import { tierLabels } from "@/lib/market-place";
import { getDocumentTypeLabel } from "@/lib/market-place/document-labels";
import type { MarketplaceTemplate } from "@/types/template";

export interface DocumentInfoTabsProps {
  /** The document's facts, from `getDocumentDetails`. Shown on the first tab. */
  details: DocumentDetail[];
  /** The template the document was made from. Shown on the second tab. */
  template: MarketplaceTemplate;
}

type InfoTab = "document" | "template";

/**
 * The header card of a document preview: a "Document" tab with what the user
 * filled in and where it stands (client, amount, status, dates), and a
 * "Template" tab with what it was built from (tier, style, type, description).
 * Opens on "Document", because that is what someone previewing their own
 * document came to check.
 */
export const DocumentInfoTabs = ({ details, template }: DocumentInfoTabsProps) => {
  const [tab, setTab] = useState<InfoTab>("document");

  return (
    <section className="document-info-tabs rounded-box border border-steel-mist bg-base-100 p-2">
      <TabMenu
        ariaLabel="Preview information"
        items={[
          {
            icon: (isActive) => (
              <FileTextIcon
                aria-hidden
                size={iconSize.tab}
                weight={navIconWeight(isActive)}
              />
            ),
            id: "document",
            label: "Document",
          },
          {
            icon: (isActive) => (
              <LayoutIcon
                aria-hidden
                size={iconSize.tab}
                weight={navIconWeight(isActive)}
              />
            ),
            id: "template",
            label: "Template",
          },
        ]}
        onChange={(id) => setTab(id === "template" ? "template" : "document")}
        value={tab}
      />

      {tab === "document" ? (
        <dl
          aria-label="Document details"
          className="grid grid-cols-2 gap-x-4 gap-y-3 px-2 pt-4 pb-2"
          role="tabpanel"
        >
          {details.map((detail) => (
            <div
              className="min-w-0"
              key={detail.label}
            >
              <dt className="text-[0.6875rem] font-semibold tracking-wide text-nox-noir/45 uppercase">
                {detail.label}
              </dt>
              <dd
                className="mt-0.5 truncate text-sm font-semibold text-nox-noir tabular-nums"
                title={detail.value}
              >
                {detail.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <div
          aria-label="Template details"
          className="px-2 pt-4 pb-2"
          role="tabpanel"
        >
          <p className="font-title text-sm font-bold text-nox-noir">
            {template.name}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant={template.tier}>{tierLabels[template.tier]}</Badge>
            <Badge variant="neutral">{template.style.name} style</Badge>
            <Badge variant="neutral">
              {getDocumentTypeLabel(template.documentType)}
            </Badge>
          </div>
          <p className="mt-3 text-sm leading-6 text-nox-noir/65">
            {template.description}
          </p>
        </div>
      )}
    </section>
  );
};
