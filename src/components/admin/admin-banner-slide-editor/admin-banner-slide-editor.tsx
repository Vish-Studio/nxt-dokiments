"use client";

import { ImageIcon, PaperPlaneTiltIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";

import {
  AdminBannerSlidePreview,
  bannerIcons,
} from "@/components/admin/admin-banner-slide-preview/admin-banner-slide-preview";
import { AdminChoiceGroup } from "@/components/admin/admin-choice-group/admin-choice-group";
import { AdminStatusPill } from "@/components/admin/admin-status-pill/admin-status-pill";
import { Button } from "@/components/commons/button/button";
import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { ConfirmDialog } from "@/components/commons/confirm-dialog/confirm-dialog";
import { EmptyState } from "@/components/commons/empty-state/empty-state";
import { Input } from "@/components/commons/input/input";
import { LinkButton } from "@/components/commons/link-button/link-button";
import { Select } from "@/components/commons/select/select";
import { TabMenu } from "@/components/commons/tab-menu/tab-menu";
import { usePageHeader } from "@/hooks/use-page-header";
import { formatDate } from "@/lib/admin/format";
import {
  type BannerIconKey,
  type BannerSlide,
  type BannerSlideErrors,
  type BannerTone,
  bannerDestinations,
  bannerIconKeys,
  bannerIconLabels,
  bannerImages,
  bannerLimits,
  bannerToneClassNames,
  bannerToneLabels,
  bannerTones,
  createBannerSlide,
  getSlideStatus,
  MAX_BANNER_POINTS,
  toDayKey,
  validateBannerSlide,
} from "@/lib/admin/marketplace-banner/banner-slide";
import { bannerStatusLabels, bannerStatusTones } from "@/lib/admin/marketplace-banner/banner-status";
import { iconSize } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useAdminBannerStore } from "@/stores/admin-banner-store";
import { useToastStore } from "@/stores/toast-store";

export interface AdminBannerSlideEditorProps {
  /** The slide to edit, or `"new"` for a blank draft. */
  slideId: string;
}

const LIST_HREF = "/admin/marketplace-banner";

const textareaClassName =
  "textarea min-h-20 w-full border border-steel-mist bg-base-200 text-base text-nox-noir transition-colors placeholder:text-nox-noir/40 focus:border-nox-noir focus:bg-base-100 focus:outline-none focus:ring-2 focus:ring-nox-noir/15";

/** `2026-12-15` → dd/mm/yy, read as a local date so the day never shifts. */
const formatDayKey = (day: string) => {
  const [year, month, date] = day.split("-").map(Number);
  return formatDate(new Date(year, month - 1, date).getTime());
};

/** One numbered part of the form ("1 Words"). */
const FormSection = ({ children, number, title }: { children: ReactNode; number: number; title: string }) => (
  <fieldset className="grid gap-4">
    <legend className="mb-4 flex items-center gap-2.5 font-title text-lg font-bold text-nox-noir">
      <span className="grid size-7 place-items-center rounded-full bg-nox-noir text-sm text-white">{number}</span>
      {title}
    </legend>
    {children}
  </fieldset>
);

/** A field's label with its character count on the right. */
const CountedLabel = ({ count, label, limit }: { count: number; label: string; limit: number }) => (
  <span className="flex justify-between gap-3">
    <span>{label}</span>
    <span className={cn("font-normal", count > limit - 6 ? "text-error" : "text-nox-noir/60")}>
      {count}/{limit}
    </span>
  </span>
);

/**
 * The Marketplace banner slide editor, at `/admin/marketplace-banner/[id]`.
 *
 * The form sits beside a sticky live preview (the real `MarketplacePromoSlide`,
 * desktop or phone), so every change is seen as customers will see it. Colours,
 * images and icons are picked by sight; the button can only open a page from a
 * fixed list. Publishing asks to confirm and says where the slide will appear.
 * A live slide offers "Hide from banner" and "Save changes" instead of "Save
 * draft" and "Publish". Delete stays in the list's ⋮ menu.
 */
export const AdminBannerSlideEditor = ({ slideId }: AdminBannerSlideEditorProps) => {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);
  const slides = useAdminBannerStore((state) => state.slides);
  const saveSlide = useAdminBannerStore((state) => state.saveSlide);
  const isNew = slideId === "new";
  const stored = slides.find((slide) => slide.id === slideId);

  const [today] = useState(toDayKey);
  const [draft, setDraft] = useState<BannerSlide | undefined>(() =>
    isNew ? createBannerSlide(`slide-${Date.now().toString(36)}`) : stored && { ...stored, points: [...stored.points] },
  );
  const [errors, setErrors] = useState<BannerSlideErrors>({});
  const [previewSize, setPreviewSize] = useState<"desktop" | "phone">("desktop");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  usePageHeader({
    back: { href: LIST_HREF, label: "Marketplace banner" },
    title: isNew ? "New slide" : "Edit slide",
  });

  if (!draft) {
    return (
      <EmptyState
        action={
          <LinkButton
            href={LIST_HREF}
            size="sm"
            variant="primary"
          >
            Back to slides
          </LinkButton>
        }
        description="It may have been deleted in this session."
        icon={<ImageIcon aria-hidden size={iconSize.feature} weight="bold" />}
        title="Slide not found"
      />
    );
  }

  const savedStatus = stored ? getSlideStatus(stored, today) : "draft";
  const isPublished = stored?.state === "published";
  const nextStatus = getSlideStatus({ ...draft, state: "published" }, today);
  const liveCount = slides.filter((slide) => slide.id !== draft.id && getSlideStatus(slide, today) === "live").length;

  const update = (changes: Partial<BannerSlide>) => {
    setDraft({ ...draft, ...changes });
    setErrors({});
  };

  const leave = (message: string) => {
    showToast({ message, tone: "success" });
    router.push(LIST_HREF);
  };

  const requestPublish = () => {
    const found = validateBannerSlide(draft);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      showToast({ message: "Fix the highlighted fields first.", tone: "error" });
      return;
    }

    setIsConfirmOpen(true);
  };

  const publish = () => {
    saveSlide({ ...draft, points: draft.points.filter((point) => point.trim()), state: "published" });
    setIsConfirmOpen(false);
    leave(nextStatus === "scheduled" ? `Slide scheduled for ${formatDayKey(draft.showFrom)}.` : isPublished ? "Changes are live." : "Slide published.");
  };

  const saveAsDraft = () => {
    saveSlide({ ...draft, state: "draft" });
    leave(isPublished ? "Slide hidden from the banner." : "Draft saved.");
  };

  const setPoint = (index: number, value: string) =>
    update({ points: draft.points.map((point, at) => (at === index ? value : point)) });

  return (
    <div className="admin-banner-slide-editor grid gap-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-nox-noir/70">
        <AdminStatusPill
          label={isNew ? "New draft" : bannerStatusLabels[savedStatus]}
          tone={isNew ? "neutral" : bannerStatusTones[savedStatus]}
        />
        {stored ? <span>Last edited {formatDate(stored.updatedAt)}</span> : <span>Not saved yet</span>}
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <form
          className="flex flex-col overflow-hidden rounded-box border border-steel-mist bg-base-100"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            requestPublish();
          }}
        >
          <div className="grid gap-8 p-5 sm:p-6">
            <FormSection
              number={1}
              title="Words"
            >
              <Input
                error={errors.eyebrow}
                id="banner-eyebrow"
                label="Label"
                maxLength={bannerLimits.eyebrow}
                onChange={(event) => update({ eyebrow: event.target.value })}
                placeholder="Launch offer"
                value={draft.eyebrow}
              />
              <AdminChoiceGroup<BannerIconKey>
                label="Label icon"
                onChange={(iconKey) => update({ iconKey })}
                options={bannerIconKeys.map((key) => {
                  const KeyIcon = bannerIcons[key];
                  return { label: bannerIconLabels[key], value: key, visual: <KeyIcon aria-hidden size={iconSize.control} weight="bold" /> };
                })}
                value={draft.iconKey}
                variant="chip"
              />
              <Input
                error={errors.title}
                id="banner-title"
                label={`Title (${draft.title.length}/${bannerLimits.title})`}
                maxLength={bannerLimits.title}
                onChange={(event) => update({ title: event.target.value })}
                placeholder="The benefit, in a few words"
                value={draft.title}
              />
              <label className="grid gap-2 font-title text-sm font-semibold text-nox-noir">
                <CountedLabel
                  count={draft.detail.length}
                  label="Text"
                  limit={bannerLimits.detail}
                />
                <textarea
                  aria-describedby={errors.detail ? "banner-detail-error" : undefined}
                  aria-invalid={errors.detail ? "true" : "false"}
                  className={cn(textareaClassName, "font-body font-normal", errors.detail && "border-error")}
                  maxLength={bannerLimits.detail}
                  onChange={(event) => update({ detail: event.target.value })}
                  placeholder="One short sentence under the title"
                  value={draft.detail}
                />
                {errors.detail ? (
                  <span
                    className="font-normal text-error"
                    id="banner-detail-error"
                  >
                    {errors.detail}
                  </span>
                ) : null}
              </label>
              <div className="grid gap-2">
                <span className="font-title text-sm font-semibold text-nox-noir">
                  List items <span className="font-normal text-nox-noir/60">· up to {MAX_BANNER_POINTS}, shown with checks</span>
                </span>
                {draft.points.map((point, index) => (
                  <div
                    className="flex items-center gap-2"
                    key={`point-${index}`}
                  >
                    <div className="flex-1">
                      <Input
                        aria-label={`List item ${index + 1}`}
                        maxLength={bannerLimits.point}
                        onChange={(event) => setPoint(index, event.target.value)}
                        placeholder="Short proof point, e.g. Clean PDF"
                        value={point}
                      />
                    </div>
                    <ButtonIcon
                      aria-label={`Remove list item ${index + 1}`}
                      className="text-error hover:bg-error/10"
                      icon={<TrashIcon aria-hidden size={iconSize.control} weight="bold" />}
                      onClick={() => update({ points: draft.points.filter((_, at) => at !== index) })}
                      size="sm"
                      type="button"
                      variant="ghost"
                    />
                  </div>
                ))}
                {errors.points ? <span className="text-sm text-error">{errors.points}</span> : null}
                {draft.points.length < MAX_BANNER_POINTS ? (
                  <Button
                    className="w-fit"
                    icon={<PlusIcon aria-hidden size={iconSize.control} weight="bold" />}
                    iconPosition="left"
                    onClick={() => update({ points: [...draft.points, ""] })}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Add item
                  </Button>
                ) : null}
              </div>
            </FormSection>

            <FormSection
              number={2}
              title="Look"
            >
              <AdminChoiceGroup<BannerTone>
                label="Colour"
                onChange={(tone) => update({ tone })}
                options={bannerTones.map((tone) => ({ label: bannerToneLabels[tone], value: tone, visual: bannerToneClassNames[tone] }))}
                value={draft.tone}
                variant="swatch"
              />
              <AdminChoiceGroup<string>
                label="Image"
                onChange={(imageSrc) => update({ imageSrc })}
                options={bannerImages.map((image) => ({
                  label: image.label,
                  value: image.src,
                  visual: (
                    <Image
                      alt=""
                      className="size-full object-cover object-left-top"
                      height={64}
                      src={image.src}
                      width={112}
                    />
                  ),
                }))}
                value={draft.imageSrc}
                variant="tile"
              />
            </FormSection>

            <FormSection
              number={3}
              title="Button and timing"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  error={errors.actionLabel}
                  id="banner-action-label"
                  label="Button text"
                  maxLength={bannerLimits.actionLabel}
                  onChange={(event) => update({ actionLabel: event.target.value })}
                  value={draft.actionLabel}
                />
                <div className="grid gap-1">
                  <Select
                    label="Opens"
                    onChange={(event) => update({ actionHref: event.target.value })}
                    options={bannerDestinations.map((destination) => ({ label: destination.label, value: destination.href }))}
                    value={draft.actionHref}
                  />
                  {errors.actionHref ? <span className="text-sm text-error">{errors.actionHref}</span> : null}
                </div>
                <Input
                  id="banner-show-from"
                  label="Show from"
                  onChange={(event) => update({ showFrom: event.target.value })}
                  type="date"
                  value={draft.showFrom}
                />
                <Input
                  error={errors.showUntil}
                  id="banner-show-until"
                  label="Until"
                  min={draft.showFrom || undefined}
                  onChange={(event) => update({ showUntil: event.target.value })}
                  type="date"
                  value={draft.showUntil}
                />
              </div>
              <p className="text-xs text-nox-noir/60">
                Leave the dates empty to show it as soon as it&apos;s published, until you hide it.
              </p>
            </FormSection>
          </div>

          <div className="sticky bottom-0 flex flex-wrap items-center gap-2 border-t border-steel-mist/70 bg-base-100 px-5 py-4 sm:px-6">
            <LinkButton
              href={LIST_HREF}
              size="sm"
              variant="outline"
            >
              Cancel
            </LinkButton>
            <span className="flex-1" />
            <Button
              icon={null}
              onClick={saveAsDraft}
              size="sm"
              type="button"
              variant="secondary"
            >
              {isPublished ? "Hide from banner" : "Save draft"}
            </Button>
            <Button
              icon={<PaperPlaneTiltIcon aria-hidden size={iconSize.control} weight="bold" />}
              iconPosition="left"
              size="sm"
              type="submit"
              variant="accent"
            >
              {isPublished ? "Save changes" : "Publish"}
            </Button>
          </div>
        </form>

        <section
          aria-label="Live preview"
          className="grid gap-3 xl:sticky xl:top-28"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-title text-xs font-bold uppercase text-nox-noir/60">Live preview</p>
              <h2 className="font-title text-xl font-bold text-nox-noir">How customers see it</h2>
            </div>
            <TabMenu
              ariaLabel="Preview size"
              items={[
                { id: "desktop", label: "Desktop" },
                { id: "phone", label: "Phone" },
              ]}
              onChange={(id) => setPreviewSize(id as "desktop" | "phone")}
              value={previewSize}
            />
          </div>
          <div className="rounded-box bg-base-200 p-4 sm:p-5">
            <AdminBannerSlidePreview
              size={previewSize}
              slide={draft}
            />
          </div>
          <p className="text-xs text-nox-noir/60">List items show once the banner is wide enough to fit them on one line.</p>
        </section>
      </div>

      <ConfirmDialog
        confirmLabel={isPublished ? "Save changes" : nextStatus === "scheduled" ? "Schedule slide" : "Publish slide"}
        confirmVariant="accent"
        description={
          nextStatus === "scheduled"
            ? `It joins the end of the rotation on ${formatDayKey(draft.showFrom)}. You can hide it again at any time.`
            : isPublished
              ? "Customers see the new version on the Marketplace straight away."
              : `Customers see it on the Marketplace straight away, as the last of ${liveCount + 1} slides. You can hide it again at any time.`
        }
        icon={PaperPlaneTiltIcon}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={publish}
        open={isConfirmOpen}
        title={isPublished ? "Save changes to this live slide?" : nextStatus === "scheduled" ? "Schedule this slide?" : "Publish this slide?"}
        tone="brand"
      />
    </div>
  );
};

export default AdminBannerSlideEditor;
