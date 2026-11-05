import { FileTextIcon } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";

export interface InvitePreviewProps {
  /** Title of the document that was shared. */
  documentName: string;
  /** Name of the person who shared it. */
  senderName: string;
  /** Address of the person who shared it, so the visitor can recognise them. */
  senderEmail: string;
  /** The actions for the visitor, such as the sign-up and sign-in buttons. */
  children?: ReactNode;
}

/**
 * What an invite link shows before the visitor has an account: who sent the
 * document, what it is called, and the next step. It deliberately shows no
 * document content; that stays behind sign-in.
 */
export const InvitePreview = ({
  documentName,
  senderName,
  senderEmail,
  children,
}: InvitePreviewProps) => (
  <section className="invite-preview rounded-box border border-steel-mist bg-white p-6">
    <div className="flex items-start gap-4">
      <span
        aria-hidden="true"
        className="flex size-12 shrink-0 items-center justify-center rounded-field bg-golden-harvest"
      >
        <FileTextIcon
          aria-hidden="true"
          size={24}
          weight="bold"
        />
      </span>
      <div className="min-w-0">
        <h2 className="font-title text-xl font-bold break-words">
          {documentName}
        </h2>
        <p className="mt-1 text-sm text-nox-noir/70">
          Shared by {senderName}
          <span className="block break-all text-nox-noir/50">
            {senderEmail}
          </span>
        </p>
      </div>
    </div>
    <p className="mt-5 text-sm leading-6 text-nox-noir/70">
      Sign in or create an account with the email address this invitation was
      sent to, and the document will open ready for your signature.
    </p>
    {children ? (
      <div className="mt-6 flex flex-col gap-3">{children}</div>
    ) : null}
  </section>
);
