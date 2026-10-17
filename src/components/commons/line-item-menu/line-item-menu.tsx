import {
  ArrowDownIcon,
  ArrowUpIcon,
  DotsThreeVerticalIcon,
  TrashIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/commons/button/button";
import { Dropdown } from "@/components/commons/dropdown/dropdown";

interface Props {
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onRemove: () => void;
}

const itemClassName = "w-full justify-start gap-2 px-3 whitespace-nowrap";

export const LineItemMenu = ({
  index,
  isFirst,
  isLast,
  onMoveDown,
  onMoveUp,
  onRemove,
}: Props) => (
  <Dropdown
    ariaLabel={`More actions for item ${index + 1}`}
    buttonClassName="size-8 min-h-8 border-0 text-nox-noir hover:bg-base-200"
    className="line-item-menu shrink-0"
    iconTrigger={
      <DotsThreeVerticalIcon
        aria-hidden
        size={18}
        weight="bold"
      />
    }
    iconTriggerShape="square"
    menuClassName="w-40"
  >
    <Button
      className={itemClassName}
      disabled={isFirst}
      icon={
        <ArrowUpIcon
          aria-hidden
          size={16}
          weight="bold"
        />
      }
      iconPosition="left"
      onClick={onMoveUp}
      size="sm"
      variant="ghost"
    >
      Move up
    </Button>
    <Button
      className={itemClassName}
      disabled={isLast}
      icon={
        <ArrowDownIcon
          aria-hidden
          size={16}
          weight="bold"
        />
      }
      iconPosition="left"
      onClick={onMoveDown}
      size="sm"
      variant="ghost"
    >
      Move down
    </Button>
    <Button
      className={`${itemClassName} text-error hover:bg-error/10`}
      icon={
        <TrashIcon
          aria-hidden
          size={16}
          weight="bold"
        />
      }
      iconPosition="left"
      onClick={onRemove}
      size="sm"
      variant="ghost"
    >
      Delete
    </Button>
  </Dropdown>
);

export default LineItemMenu;
