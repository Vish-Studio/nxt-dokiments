"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CopyIcon,
  DotsThreeVerticalIcon,
  EyeSlashIcon,
  ImageIcon,
  PaperPlaneTiltIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { toPromoSlideProps } from "@/components/admin/admin-banner-slide-preview/admin-banner-slide-preview";
import { AdminSampleNotice } from "@/components/admin/admin-sample-notice/admin-sample-notice";
import { AdminStatusPill } from "@/components/admin/admin-status-pill/admin-status-pill";
import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { ConfirmDialog } from "@/components/commons/confirm-dialog/confirm-dialog";
import { Dropdown } from "@/components/commons/dropdown/dropdown";
import { EmptyState } from "@/components/commons/empty-state/empty-state";
import { LinkButton } from "@/components/commons/link-button/link-button";
import { TabMenu } from "@/components/commons/tab-menu/tab-menu";
import { DashboardList } from "@/components/dashboard/dashboard-list/dashboard-list";
import { DashboardListRow } from "@/components/dashboard/dashboard-list-row/dashboard-list-row";
import { ActionItem } from "@/components/dashboard/document-action-items/document-action-items";
import { MarketplacePromoCarousel } from "@/components/dashboard/marketplace-promo-banner/marketplace-promo-carousel";
import { formatDate, formatCount } from "@/lib/admin/format";
import {
  type BannerSlide,
  type BannerSlideStatus,
  bannerDestinations,
  bannerToneClassNames,
  getSlideStatus,
  toDayKey,
} from "@/lib/admin/marketplace-banner/banner-slide";
import { bannerStatusLabels, bannerStatusTones } from "@/lib/admin/marketplace-banner/banner-status";
import { iconSize } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useAdminBannerStore } from "@/stores/admin-banner-store";
import { useToastStore } from "@/stores/toast-store";

/**
 * The list tabs. Ended slides are grouped with drafts: neither is shown to
 * customers, and both are reopened the same way.
 */
type BannerTab = "draft" | "live" | "scheduled";

const tabOf: Record<BannerSlideStatus, BannerTab> = { draft: "draft", ended: "draft", live: "live", scheduled: "scheduled" };

const tabHints: Record<BannerTab, string> = {
  draft: "Not shown to customers. Open one to finish and publish it.",
  live: "Rotate on the Marketplace in this order. Use the arrows to reorder.",
  scheduled: "Join the end of the rotation on their first day.",
};

const columns = [
  { className: "col-span-1", label: "Order" },
  { className: "col-span-6", label: "Slide" },
  { className: "col-span-3", label: "Status" },
  { className: "col-span-2 text-right", label: "Actions" },
];

/** `2026-12-15` → dd/mm/yy, read as a local date so the day never shifts. */
const formatDayKey = (day: string) => {
  const [year, month, date] = day.split("-").map(Number);
  return formatDate(new Date(year, month - 1, date).getTime());
};

/** The one line under a slide's status: since when, from when, or when it was edited. */
const describeTiming = (slide: BannerSlide, status: BannerSlideStatus) => {
  if (status === "scheduled") return `From ${formatDayKey(slide.showFrom)}${slide.showUntil ? ` to ${formatDayKey(slide.showUntil)}` : ""}`;
  if (status === "ended") return `Ended ${formatDayKey(slide.showUntil)}`;
  if (status === "live" && slide.showUntil) return `Until ${formatDayKey(slide.showUntil)}`;
  return `Edited ${formatDate(slide.updatedAt)}`;
};

const destinationLabel = (href: string) =>
  bannerDestinations.find((destination) => destination.href === href)?.label ?? href;

/**
 * The Marketplace banner admin: the banner exactly as customers see it now,
 * then its slides by status, with reorder and a ⋮ menu per slide.
 *
 * Editing happens on its own page (`AdminBannerSlideEditor`), so this page
 * stays a short, scannable list. Slides come from `useAdminBannerStore`, sample
 * data for this browser session until the banner is stored in Firestore.
 */
export const AdminMarketplaceBannerView = () => {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);
  const { duplicateSlide, moveSlide, removeSlide, saveSlide, slides } = useAdminBannerStore();
  const [tab, setTab] = useState<BannerTab>("live");
  const [deleting, setDeleting] = useState<BannerSlide | null>(null);

  // Read once on mount: status only changes at midnight, and render must stay pure.
  const [today] = useState(toDayKey);
  const withStatus = slides.map((slide) => ({ slide, status: getSlideStatus(slide, today) }));
  const live = withStatus.filter((item) => item.status === "live");
  const visible = withStatus.filter((item) => tabOf[item.status] === tab);
  const countOf = (id: BannerTab) => withStatus.filter((item) => tabOf[item.status] === id).length;

  const setState = (slide: BannerSlide, state: BannerSlide["state"]) => {
    saveSlide({ ...slide, state });
    showToast({
      message: state === "published" ? "Slide published." : "Slide hidden from the banner.",
      tone: "success",
    });
  };

  return (
    <div className="admin-marketplace-banner-view grid gap-6">
      <AdminSampleNotice reason="The live banner still reads its slides from code, so these slides and your changes last for this session only." />

      <section
        aria-labelledby="banner-live-heading"
        className="grid gap-3"
      >
        <div>
          <p className="font-title text-xs font-bold uppercase text-nox-noir/60">Live now</p>
          <h2
            className="font-title text-xl font-bold text-nox-noir"
            id="banner-live-heading"
          >
            What customers see on the Marketplace
          </h2>
        </div>
        {live.length > 0 ? (
          <MarketplacePromoCarousel slides={live.map((item) => toPromoSlideProps(item.slide))} />
        ) : (
          <EmptyState
            action={
              <LinkButton
                href="/admin/marketplace-banner/new"
                size="sm"
                variant="accent"
              >
                New slide
              </LinkButton>
            }
            description="Customers see no banner on the Marketplace until a slide is live."
            icon={<ImageIcon aria-hidden size={iconSize.feature} weight="bold" />}
            title="No live slides"
          />
        )}
      </section>

      <section className="grid gap-2">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <TabMenu
            ariaLabel="Slides by status"
            items={(["live", "scheduled", "draft"] as const).map((id) => ({
              badge: formatCount(countOf(id)),
              id,
              label: { draft: "Drafts", live: "Live", scheduled: "Scheduled" }[id],
            }))}
            onChange={(id) => setTab(id as BannerTab)}
            value={tab}
          />
          <p className="flex-1 text-sm text-nox-noir/60">{tabHints[tab]}</p>
          <LinkButton
            href="/admin/marketplace-banner/new"
            icon={<PlusIcon aria-hidden size={iconSize.control} weight="bold" />}
            iconPosition="left"
            size="sm"
            variant="accent"
          >
            New slide
          </LinkButton>
        </div>

        {visible.length === 0 ? (
          <EmptyState
            description={tab === "draft" ? "Drafts you save appear here." : tab === "scheduled" ? "Publish a slide with a later first day to schedule it." : "Publish a slide to put it in the rotation."}
            icon={<ImageIcon aria-hidden size={iconSize.feature} weight="bold" />}
            title={tab === "draft" ? "No drafts" : tab === "scheduled" ? "Nothing scheduled" : "No live slides"}
          />
        ) : (
          <DashboardList
            columns={columns}
            ordered={tab === "live"}
          >
            {visible.map(({ slide, status }, index) => (
              <DashboardListRow
                className="focus-within:z-30"
                key={slide.id}
              >
                <div className="flex items-center gap-1 sm:col-span-1 sm:flex-col sm:items-start">
                  {tab === "live" ? (
                    <>
                      <ButtonIcon
                        aria-label={`Move ${slide.title} up`}
                        className="size-8 min-h-8"
                        disabled={index === 0}
                        icon={<ArrowUpIcon aria-hidden size={iconSize.inline} weight="bold" />}
                        onClick={() => moveSlide(slide.id, -1)}
                        size="sm"
                        variant="ghost"
                      />
                      <span className="w-8 text-center font-title text-sm font-bold">{index + 1}</span>
                      <ButtonIcon
                        aria-label={`Move ${slide.title} down`}
                        className="size-8 min-h-8"
                        disabled={index === visible.length - 1}
                        icon={<ArrowDownIcon aria-hidden size={iconSize.inline} weight="bold" />}
                        onClick={() => moveSlide(slide.id, 1)}
                        size="sm"
                        variant="ghost"
                      />
                    </>
                  ) : (
                    <span className="text-sm text-nox-noir/40">—</span>
                  )}
                </div>

                <div className="flex min-w-0 items-center gap-4 sm:col-span-6">
                  <span
                    aria-hidden
                    className={cn(
                      "grid h-16 w-28 shrink-0 content-center gap-1 overflow-hidden rounded-field px-2.5",
                      bannerToneClassNames[slide.tone],
                    )}
                  >
                    <span className="h-1.5 w-2/5 rounded-full bg-white/70" />
                    <span className="line-clamp-2 font-title text-[10px] leading-3 font-bold text-nox-noir">
                      {slide.title || "Untitled slide"}
                    </span>
                    <span className="h-2 w-2/5 rounded-[3px] bg-nox-noir" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-title text-sm font-bold text-nox-noir">
                      {slide.title || "Untitled slide"}
                    </span>
                    <span className="block truncate text-xs text-nox-noir/60">
                      {slide.eyebrow || "No label"} · Opens {destinationLabel(slide.actionHref)}
                    </span>
                  </span>
                </div>

                <div className="grid justify-items-start gap-1 sm:col-span-3">
                  <AdminStatusPill
                    label={bannerStatusLabels[status]}
                    tone={bannerStatusTones[status]}
                  />
                  <span className="text-xs text-nox-noir/60">{describeTiming(slide, status)}</span>
                </div>

                <div className="flex items-center gap-1 sm:col-span-2 sm:justify-end">
                  <LinkButton
                    href={`/admin/marketplace-banner/${slide.id}`}
                    size="sm"
                    variant="outline"
                  >
                    Edit
                  </LinkButton>
                  <Dropdown
                    align="end"
                    ariaLabel={`More actions for ${slide.title || "Untitled slide"}`}
                    buttonClassName="size-8 min-h-8 text-nox-noir hover:bg-base-200"
                    iconTrigger={<DotsThreeVerticalIcon aria-hidden size={iconSize.tile} weight="bold" />}
                    iconTriggerShape="square"
                    menuClassName="w-56"
                    sheetIcon={ImageIcon}
                    sheetTitle={slide.title || "Untitled slide"}
                  >
                    <ActionItem
                      icon={CopyIcon}
                      label="Duplicate"
                      onClick={() => {
                        const copyId = duplicateSlide(slide.id);
                        showToast({ message: "Copy saved as a draft.", tone: "success" });
                        if (copyId) router.push(`/admin/marketplace-banner/${copyId}`);
                      }}
                    />
                    {slide.state === "published" ? (
                      <ActionItem
                        icon={EyeSlashIcon}
                        label="Hide from banner"
                        onClick={() => setState(slide, "draft")}
                      />
                    ) : (
                      <ActionItem
                        icon={PaperPlaneTiltIcon}
                        label="Open to publish"
                        onClick={() => router.push(`/admin/marketplace-banner/${slide.id}`)}
                      />
                    )}
                    <div
                      aria-hidden
                      className="my-1 h-px bg-steel-mist/60"
                    />
                    <ActionItem
                      icon={TrashIcon}
                      label="Delete"
                      onClick={() => setDeleting(slide)}
                      tone="danger"
                    />
                  </Dropdown>
                </div>
              </DashboardListRow>
            ))}
          </DashboardList>
        )}
      </section>

      <ConfirmDialog
        confirmLabel="Delete slide"
        confirmVariant="danger"
        description={
          deleting && getSlideStatus(deleting, today) === "live"
            ? "It's live now, so it leaves the Marketplace banner straight away. This can't be undone."
            : "This can't be undone."
        }
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) removeSlide(deleting.id);
          setDeleting(null);
          showToast({ message: "Slide deleted.", tone: "success" });
        }}
        open={deleting !== null}
        title="Delete slide?"
        tone="danger"
      />
    </div>
  );
};

export default AdminMarketplaceBannerView;
