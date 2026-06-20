import { BookmarkSimple, Eye, LockIcon } from "@phosphor-icons/react";
import Link from "next/link";

import { Button } from "@/components/button/button";
import { ButtonIcon } from "@/components/button-icon/button-icon";
import { TemplateThumbnail } from "@/components/template-thumbnail/template-thumbnail";
import { documentIcons, tierBadgeClasses, tierLabels } from "@/lib/market-place";
import { cn } from "@/lib/utils";
import type { MarketplaceTemplate } from "@/types/template";

export type TemplateCardProps = {
  locked?: boolean;
  onPreview: () => void;
  onSave: () => void;
  saved?: boolean;
  template: MarketplaceTemplate;
};

const actionLinkClassName = "btn btn-sm flex-1 font-title font-semibold tracking-normal";

export const TemplateCard = ({
  locked = false,
  onPreview,
  onSave,
  saved = false,
  template,
}: TemplateCardProps) => {
  const Icon = documentIcons[template.documentType];

  return (
    <article className="flex flex-col rounded-box border border-steel-mist bg-base-100 p-4">
      <div className="relative">
        <TemplateThumbnail template={template} />
      </div>

      <div className="mt-4 flex justify-between gap-2">
        <div className="flex gap-2 items-center">
          <Icon aria-hidden className="shrink-0 text-bloodwood-deep" size={18} weight="bold" />
          <h4 className="font-title text-base font-bold text-nox-noir">{template.name}</h4>
        </div>

        <span
          className={cn(
            "flex items-center gap-1 rounded-field px-2 py-1 font-title text-[11px] font-semibold",
            tierBadgeClasses[template.tier],
          )}
        >
          {locked ? <LockIcon aria-hidden size={11} weight="bold" /> : null}
          {tierLabels[template.tier]}
        </span>
      </div>


      <p className="mt-1 flex-1 text-sm leading-6 text-nox-noir/60">{template.description}</p>

      <div className="mt-5 flex items-center gap-2">
        <ButtonIcon
          aria-label={`Preview ${template.name}`}
          icon={<Eye aria-hidden size={17} weight="bold" />}
          onClick={onPreview}
          shape="square"
          size="sm"
          variant="outline"
        />

        {locked ? (
          <Link className={cn(actionLinkClassName, "btn-primary")} href="/subscription">
            Upgrade
          </Link>
        ) : saved ? (
          <Link
            className={cn(
              actionLinkClassName,
              "border border-steel-mist bg-base-100 text-nox-noir hover:bg-base-200",
            )}
            href="/my-templates"
          >
            Saved
          </Link>
        ) : (
          <Button
            className="flex-1"
            icon={<BookmarkSimple aria-hidden size={17} weight="bold" />}
            iconPosition="left"
            onClick={onSave}
            size="sm"
          >
            Save template
          </Button>
        )}
      </div>
    </article>
  );
};
