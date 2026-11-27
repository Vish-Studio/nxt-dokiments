import {
  ArrowDownIcon,
  ArrowUpIcon,
  DotsThreeVerticalIcon,
  TrashIcon,
} from "@phosphor-icons/react";

import { Dropdown } from "@/components/commons/dropdown/dropdown";
import { DropdownMenuItem } from "@/components/commons/dropdown-menu-item/dropdown-menu-item";

interface Props {
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onRemove: () => void;
}

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
    <DropdownMenuItem
      disabled={isFirst}
      icon={ArrowUpIcon}
      onClick={onMoveUp}
    >
      Move up
    </DropdownMenuItem>
    <DropdownMenuItem
      disabled={isLast}
      icon={ArrowDownIcon}
      onClick={onMoveDown}
    >
      Move down
    </DropdownMenuItem>
    <DropdownMenuItem
      icon={TrashIcon}
      onClick={onRemove}
      tone="danger"
    >
      Delete
    </DropdownMenuItem>
  </Dropdown>
);

export default LineItemMenu;
