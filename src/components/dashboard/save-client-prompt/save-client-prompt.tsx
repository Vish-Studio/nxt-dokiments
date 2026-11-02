import { CheckCircleIcon, UserPlusIcon } from "@phosphor-icons/react";

import { Button } from "@/components/commons/button/button";

interface Props {
  /** The recipient name typed into the document. */
  clientName: string;
  /** True when these details already belong to a saved client. */
  isSaved: boolean;
  /** What still needs filling before the client can be saved, e.g. "email and phone". */
  missing?: string;
  onSave: () => void;
}

// Shown under a new client's details once a name is typed: offers to keep them in My Clients,
// or confirms they are already there.
export const SaveClientPrompt = ({
  clientName,
  isSaved,
  missing,
  onSave,
}: Props) => {
  if (isSaved) {
    return (
      <p className="save-client-prompt flex items-center gap-2 text-xs text-nox-noir/60">
        <CheckCircleIcon
          aria-hidden
          className="shrink-0 text-success"
          size={16}
          weight="fill"
        />
        {clientName} is already in My Clients.
      </p>
    );
  }

  return (
    <div
      className="save-client-prompt flex flex-col gap-3 rounded-field border border-play-blue bg-play-blue/20 p-3 sm:flex-row sm:items-center"
      role="status"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-play-blue text-nox-noir">
        <UserPlusIcon
          aria-hidden
          size={18}
          weight="bold"
        />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-title text-sm font-bold text-nox-noir">
          Save {clientName} for next time?
        </p>
        <p className="text-xs leading-5 text-nox-noir/60">
          {missing
            ? `Add their ${missing} above to save them to My Clients.`
            : "Add them to My Clients and their details fill in with one click."}
        </p>
      </div>
      <Button
        className="shrink-0"
        disabled={Boolean(missing)}
        onClick={onSave}
        size="sm"
        variant="primary"
      >
        Save client
      </Button>
    </div>
  );
};

export default SaveClientPrompt;
