import { Text } from "@react-email/components";

import { siteName } from "@/lib/seo/site";

import { EmailLayout } from "./email-layout";

export type SharedDocumentEmailVariant = "shared" | "updated";

export interface SharedDocumentEmailProps {
  /** `shared` for the first share, `updated` when the sender re-shares. */
  variant: SharedDocumentEmailVariant;
  /** Name of the person who shared the document. Shown as plain text. */
  senderName: string;
  /** Title of the shared document. Shown as plain text. */
  documentName: string;
  /** Absolute link the button opens, normally `/my-documents?tab=shared`. */
  url: string;
}

const paragraph = { margin: "0 0 16px" } as const;

/** Subject line for the email, kept next to the template so the two stay in step. */
export const sharedDocumentEmailSubject = ({
  variant,
  senderName,
  documentName,
}: Pick<
  SharedDocumentEmailProps,
  "variant" | "senderName" | "documentName"
>) =>
  variant === "shared"
    ? `${senderName} shared "${documentName}" with you`
    : `${senderName} updated "${documentName}"`;

/**
 * The email a recipient gets when a document is shared with them for signature,
 * or when the sender shares it again. Built on `EmailLayout`.
 *
 * Pass `senderName` and `documentName` already cleaned (see
 * `cleanEmailLabel`); React escapes them as text, so they cannot inject markup.
 *
 * @example
 * <SharedDocumentEmail
 *   variant="shared"
 *   senderName="Jane Doe"
 *   documentName="Service agreement"
 *   url="https://dokiments.com/my-documents?tab=shared"
 * />
 */
export const SharedDocumentEmail = ({
  variant,
  senderName,
  documentName,
  url,
}: SharedDocumentEmailProps) => {
  const isUpdate = variant === "updated";

  return (
    <EmailLayout
      action={{ href: url, label: "Open document" }}
      heading={
        isUpdate
          ? `${senderName} updated a shared document`
          : `${senderName} shared a document with you`
      }
      preview={sharedDocumentEmailSubject({
        documentName,
        senderName,
        variant,
      })}
    >
      <Text style={paragraph}>
        {isUpdate
          ? `${senderName} made changes to "${documentName}". Open it to review the latest version and sign.`
          : `${senderName} shared "${documentName}" with you on ${siteName} for your signature.`}
      </Text>
      <Text style={paragraph}>
        New to {siteName}? Create an account with this email address and the
        document will be waiting under Shared with me.
      </Text>
    </EmailLayout>
  );
};
