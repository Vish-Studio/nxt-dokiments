import {
  DotsThreeIcon,
  EnvelopeSimpleIcon,
  PencilSimpleIcon,
  PhoneIcon,
  TrashIcon,
} from "@phosphor-icons/react";

import { Avatar } from "@/components/commons/avatar/avatar";
import { Button } from "@/components/commons/button/button";
import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { Dropdown } from "@/components/commons/dropdown/dropdown";
import { isOptimisticClient } from "@/hooks/queries/use-clients";
import type { Client } from "@/types/client";

export interface ClientListItemProps {
  client: Client;
  onDelete: (client: Client) => void;
  onEdit: (client: Client) => void;
  onPreview: (client: Client) => void;
}

/** Card shell, shared with `ClientListSkeleton` so loading cards match loaded ones. */
export const clientCardClassName =
  "flex h-44 flex-col rounded-box border border-steel-mist bg-base-100 p-4";

const avatarColorClasses = [
  "bg-play-blue",
  "bg-play-teal",
  "bg-play-purple",
  "bg-play-pink",
  "bg-play-amber",
  "bg-golden-harvest",
];

const getAvatarColorClass = (clientId: string) => {
  const characterTotal = Array.from(clientId).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );

  return avatarColorClasses[characterTotal % avatarColorClasses.length];
};

export const ClientListItem = ({
  client,
  onDelete,
  onEdit,
  onPreview,
}: ClientListItemProps) => {
  const isPending = isOptimisticClient(client);

  return (
    <article
      className={`client-list-item ${clientCardClassName} transition-colors hover:border-play-blue`}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar
            className={`${getAvatarColorClass(client.id)} text-nox-noir`}
            name={client.name}
            size="md"
          />
          <div className="min-w-0">
            <p className="truncate font-title text-sm font-bold text-nox-noir">
              {client.name}
            </p>
            <p className="mt-0.5 truncate text-xs text-nox-noir/50">
              {client.companyName || "No company"}
            </p>
          </div>
        </div>
        {isPending ? (
          <ButtonIcon
            aria-label={`More actions for ${client.name}`}
            className="size-8 min-h-8"
            disabled
            icon={<DotsThreeIcon aria-hidden size={18} weight="bold" />}
            shape="square"
            size="sm"
            variant="ghost"
          />
        ) : (
          <Dropdown
            ariaLabel={`More actions for ${client.name}`}
            buttonClassName="size-8 min-h-8 text-nox-noir hover:bg-base-200"
            className="shrink-0"
            iconTrigger={<DotsThreeIcon aria-hidden size={20} weight="bold" />}
            iconTriggerShape="square"
            menuClassName="w-36"
          >
            <Button
              className="w-full justify-start gap-2 px-3 whitespace-nowrap"
              icon={<PencilSimpleIcon aria-hidden size={16} weight="bold" />}
              iconPosition="left"
              onClick={() => onEdit(client)}
              size="sm"
              variant="ghost"
            >
              Edit client
            </Button>
            <Button
              className="w-full justify-start gap-2 px-3 whitespace-nowrap text-error hover:bg-error/10"
              icon={<TrashIcon aria-hidden size={16} weight="bold" />}
              iconPosition="left"
              onClick={() => onDelete(client)}
              size="sm"
              variant="ghost"
            >
              Delete
            </Button>
          </Dropdown>
        )}
      </div>

      <div className="mt-4 space-y-1.5 text-xs text-nox-noir/60">
        <p className="flex min-w-0 items-center gap-2">
          <EnvelopeSimpleIcon aria-hidden className="shrink-0" size={14} />
          <span className="truncate">{client.email || "No email"}</span>
        </p>
        <p className="flex min-w-0 items-center gap-2">
          <PhoneIcon aria-hidden className="shrink-0" size={14} />
          <span className="truncate">{client.phone || "No phone"}</span>
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-3">
        {isPending ? (
          <span className="text-xs text-nox-noir/45">Saving client…</span>
        ) : (
          <Button
            aria-label={`View details for ${client.name}`}
            className="h-8 min-h-8 px-3 text-xs"
            onClick={() => onPreview(client)}
            size="sm"
            variant="secondary"
          >
            View client
          </Button>
        )}
      </div>
    </article>
  );
};
