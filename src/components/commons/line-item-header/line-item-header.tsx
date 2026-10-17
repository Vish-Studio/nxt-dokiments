import { CheckIcon } from "@phosphor-icons/react";

import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { LineItemMenu } from "@/components/commons/line-item-menu/line-item-menu";

interface Props {
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onDone?: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onRemove: () => void;
}

export const LineItemHeader = ({ index, onDone, ...menuProps }: Props) => {
  const position = index + 1;

  return (
    <div className="line-item-header flex items-center justify-between gap-3 border-b border-steel-mist pb-3">
      <span className="font-title text-sm font-bold text-nox-noir">
        Item {position}
      </span>
      <div className="flex items-center gap-1">
        <LineItemMenu
          index={index}
          {...menuProps}
        />
        {onDone ? (
          <ButtonIcon
            aria-label={`Done editing item ${position}`}
            className="size-8 min-h-8"
            icon={
              <CheckIcon
                aria-hidden
                size={16}
                weight="bold"
              />
            }
            onClick={onDone}
            shape="square"
            size="sm"
            variant="primary"
          />
        ) : null}
      </div>
    </div>
  );
};

export default LineItemHeader;
