import { Text } from "@react-email/components";

import { EmailLayout } from "./email-layout";

export interface SignedDocumentEmailProps {
  /** Who signed: their display name, or their email when they have none. Shown as plain text. */
  signerName: string;
  /** Title of the signed document. Shown as plain text. */
  documentName: string;
  /** Pre-formatted time of the signature, for example `31 Oct 2026, 21:30 UTC`. */
  signedAtLabel: string;
  /** Absolute link the button opens, normally `/my-documents/shared/[id]`. */
  url: string;
}

const paragraph = { margin: "0 0 16px" } as const;

/** Subject line for the email, kept next to the template so the two stay in step. */
export const signedDocumentEmailSubject = ({
  signerName,
  documentName,
}: Pick<SignedDocumentEmailProps, "signerName" | "documentName">) =>
  `${signerName} signed "${documentName}"`;

/**
 * The email an owner gets when the recipient signs their shared document. It
 * says only that the document was signed and when, never the signature itself.
 * Built on `EmailLayout`.
 *
 * Pass `signerName` and `documentName` already cleaned (see
 * `cleanEmailLabel`); React escapes them as text, so they cannot inject markup.
 *
 * @example
 * <SignedDocumentEmail
 *   signerName="Bob Smith"
 *   documentName="Service agreement"
 *   signedAtLabel="31 Oct 2026, 21:30 UTC"
 *   url="https://dokiments.com/my-documents/shared/abc"
 * />
 */
export const SignedDocumentEmail = ({
  signerName,
  documentName,
  signedAtLabel,
  url,
}: SignedDocumentEmailProps) => (
  <EmailLayout
    action={{ href: url, label: "Open document" }}
    heading={`${signerName} signed your document`}
    preview={signedDocumentEmailSubject({ documentName, signerName })}
  >
    <Text style={paragraph}>
      {signerName} signed &quot;{documentName}&quot; on {signedAtLabel}.
    </Text>
    <Text style={paragraph}>
      The document is now locked, so it can no longer be changed. Open it to see
      the signed copy.
    </Text>
  </EmailLayout>
);
