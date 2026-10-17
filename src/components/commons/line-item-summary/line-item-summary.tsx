import { PencilSimpleIcon } from "@phosphor-icons/react";

import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { LineItemMenu } from "@/components/commons/line-item-menu/line-item-menu";
import { itemAmount, type LineItem } from "@/lib/market-place/line-items";

interface Props {
  index: number;
  isFirst: boolean;
  isLast: boolean;
  item: LineItem;
  onEdit: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onRemove: () => void;
}

// Mirrors the edit card's layout and labels, with plain text where the inputs would be.
const labelClassName = "font-title text-sm font-semibold text-nox-noir";
const valueClassName = "mt-1 text-sm text-nox-noir/70 wrap-break-word";

export const LineItemSummary = ({
  index,
  item,
  onEdit,
  ...menuProps
}: Props) => {
  const position = index + 1;

  return (
    <div
      aria-label={`Item ${position}`}
      className="line-item-summary grid min-w-0 gap-3 rounded-field border border-steel-mist p-4"
      role="group"
    >
      <div className="flex items-center justify-between gap-3 border-b border-steel-mist pb-3">
        <span className="font-title text-sm font-bold text-nox-noir">
          Item {position}
        </span>
        <div className="flex items-center gap-1">
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
      <dl className="grid min-w-0 grid-cols-3 gap-3">
        <div className="col-span-3 min-w-0">
          <dt className={labelClassName}>Description</dt>
          <dd className={valueClassName}>{item.description || "—"}</dd>
        </div>
        <div className="min-w-0">
          <dt className={labelClassName}>Quantity</dt>
          <dd className={valueClassName}>{item.quantity || "—"}</dd>
        </div>
        <div className="min-w-0">
          <dt className={labelClassName}>Unit price</dt>
          <dd className={valueClassName}>{item.price || "—"}</dd>
        </div>
        <div className="min-w-0">
          <dt className={labelClassName}>Amount</dt>
          <dd className={`${valueClassName} font-semibold text-nox-noir`}>
            {itemAmount(item)}
          </dd>
        </div>
      </dl>
    </div>
  );
};

export default LineItemSummary;
