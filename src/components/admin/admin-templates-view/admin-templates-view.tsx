"use client";

import { LayoutIcon, PaletteIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import { AdminQueryState } from "@/components/admin/admin-query-state/admin-query-state";
import { Badge } from "@/components/commons/badge/badge";
import CollectionToolbar from "@/components/commons/collection-toolbar/collection-toolbar";
import { EmptyState } from "@/components/commons/empty-state/empty-state";
import { TabMenu } from "@/components/commons/tab-menu/tab-menu";
import { TemplateThumbnail } from "@/components/commons/template-thumbnail/template-thumbnail";
import { SettingsCard } from "@/components/dashboard/settings-card/settings-card";
import { useTemplatesQuery } from "@/hooks/queries/use-templates";
import { formatCount, pluralise } from "@/lib/admin/format";
import { iconSize } from "@/lib/icons";
import { tierLabels } from "@/lib/market-place";
import { getDocumentTypeLabel } from "@/lib/market-place/document-labels";
import type { TemplateTier } from "@/types/template";

/**
 * The two views of the catalog.
 * - `catalog`: every template, searchable, filtered by style.
 * - `styles`: each style with its plan and how many templates use it.
 */
type TemplatesTab = "catalog" | "styles";

const tierBadge: Record<TemplateTier, "free" | "gold" | "silver"> = {
  free: "free",
  gold: "gold",
  silver: "silver",
};

/**
 * The admin Templates page: the live marketplace catalog and its styles.
 *
 * Real data from the same `GET /api/templates` the Marketplace uses, so it
 * shows exactly what customers see. Read-only: the catalog is still seeded by
 * `scripts/seed-templates.ts`, and editing it here would fork the two.
 */
export const AdminTemplatesView = () => {
  const catalog = useTemplatesQuery();
  const [tab, setTab] = useState<TemplatesTab>("catalog");
  const [search, setSearch] = useState("");
  const [styleId, setStyleId] = useState("all");

  const templates = useMemo(() => catalog.data?.templates ?? [], [catalog.data]);
  const styles = catalog.data?.styles ?? [];

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();

    return templates.filter((template) => {
      if (styleId !== "all" && template.style.id !== styleId) return false;

      return (
        !query ||
        template.name.toLowerCase().includes(query) ||
        getDocumentTypeLabel(template.documentType).toLowerCase().includes(query)
      );
    });
  }, [search, styleId, templates]);

  return (
    <AdminQueryState
      errorTitle="We couldn't load the catalog"
      isError={catalog.isError}
      isPending={catalog.isPending}
      loadingMessage="Loading the catalog"
      onRetry={() => void catalog.refetch()}
    >
      <div className="admin-templates-view grid gap-2">
        <TabMenu
          ariaLabel="Templates view"
          className="mb-2 self-start"
          items={[
            {
              badge: formatCount(templates.length),
              icon: <LayoutIcon aria-hidden size={iconSize.tab} weight="bold" />,
              id: "catalog",
              label: "Catalog",
            },
            {
              badge: formatCount(styles.length),
              icon: <PaletteIcon aria-hidden size={iconSize.tab} weight="bold" />,
              id: "styles",
              label: "Styles",
            },
          ]}
          onChange={(id) => setTab(id as TemplatesTab)}
          value={tab}
        />

        {tab === "catalog" ? (
          <>
            <CollectionToolbar
              appearance="compact"
              ariaLabel="Search and filter templates"
              canReset={Boolean(search) || styleId !== "all"}
              filterStyle="chips"
              filters={[
                {
                  defaultValue: "all",
                  id: "style",
                  label: "Style",
                  onChange: setStyleId,
                  options: [
                    { label: "All styles", value: "all" },
                    ...styles.map((style) => ({ label: style.name, value: style.id })),
                  ],
                  value: styleId,
                },
              ]}
              onReset={() => {
                setSearch("");
                setStyleId("all");
              }}
              onSearch={setSearch}
              onSort={() => undefined}
              resultLabel={pluralise(visible.length, "template")}
              search={search}
              searchLabel="Search templates"
              searchPlaceholder="Search by name or document type"
              sort="catalog"
              sortOptions={[{ label: "Catalog order", value: "catalog" }]}
            />

            {visible.length === 0 ? (
              <EmptyState
                description="Try another name, or clear the style filter."
                icon={<LayoutIcon aria-hidden size={iconSize.feature} weight="bold" />}
                title="No matching templates"
              />
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {visible.map((template) => (
                  <li
                    className="flex flex-col overflow-hidden rounded-box border border-steel-mist bg-base-100"
                    key={template.id}
                  >
                    <div className="h-44 overflow-hidden bg-play-pink/45 p-4">
                      <TemplateThumbnail
                        compact
                        template={template}
                      />
                    </div>
                    <div className="grid gap-1.5 p-4">
                      <span className="truncate font-title text-sm font-bold text-nox-noir">{template.name}</span>
                      <span className="text-xs text-nox-noir/60">
                        {getDocumentTypeLabel(template.documentType)} · {template.style.name}
                      </span>
                      <Badge
                        className="w-fit"
                        variant={tierBadge[template.tier]}
                      >
                        {tierLabels[template.tier]}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {styles.map((style) => (
              <SettingsCard
                action={<Badge variant={tierBadge[style.tier]}>{tierLabels[style.tier]}</Badge>}
                description={style.description}
                icon={PaletteIcon}
                key={style.id}
                title={style.name}
                tone="pink"
              >
                <p className="flex justify-between rounded-field bg-base-200 px-3 py-2.5 text-sm">
                  <span className="text-nox-noir/70">Templates in this style</span>
                  <b className="font-title">
                    {formatCount(templates.filter((template) => template.style.id === style.id).length)}
                  </b>
                </p>
              </SettingsCard>
            ))}
          </div>
        )}
      </div>
    </AdminQueryState>
  );
};

export default AdminTemplatesView;
