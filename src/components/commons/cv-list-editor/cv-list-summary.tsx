"use client";

import { PencilSimpleIcon } from "@phosphor-icons/react";

import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { LineItemMenu } from "@/components/commons/line-item-menu/line-item-menu";
import {
  clampLevel,
  type CvListConfig,
  type CvRow,
} from "@/lib/market-place/cv-lists";

interface Props {
  config: CvListConfig;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onRemove: () => void;
  row: CvRow;
}

export const CvListSummary = ({
  config,
  index,
  onEdit,
  row,
  ...menuProps
}: Props) => {
  const position = index + 1;
  const title = row[config.primaryKey]?.trim() || `Item ${position}`;
  const details = config.fields
    .filter((field) => field.key !== config.primaryKey && field.type === "text")
    .map((field) => row[field.key]?.trim())
    .filter(Boolean)
    .join(" · ");
  const level = row.level !== undefined ? `${clampLevel(row.level)}%` : "";

  return (
    <div
      aria-label={`Item ${position}`}
      className="cv-list-summary flex min-w-0 items-center justify-between gap-3 rounded-field border border-steel-mist p-3"
      role="group"
    >
      <div className="min-w-0">
        <p className="truncate font-title text-sm font-bold text-nox-noir">
          {title}
        </p>
        {details || level ? (
          <p className="truncate text-xs text-nox-noir/60">
            {details || level}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <ButtonIcon
          aria-label={`Edit item ${position}`}
          className="size-8 min-h-8 border-0 text-nox-noir hover:bg-base-200"
          icon={
            <PencilSimpleIcon
              aria-hidden
              size={18}
              weight="bold"
            />
          }
          onClick={onEdit}
          shape="square"
          size="sm"
          variant="ghost"
        />
        <LineItemMenu
          index={index}
          {...menuProps}
        />
      </div>
    </div>
  );
};

export default CvListSummary;
