import { normaliseEmail } from "@/lib/sharing/email";
import type { ShareRecipientStatus, SharedDocument } from "@/types/sharing";

/** The given account's progress on a shared document; `pending` if it is not listed. */
export const recipientStatusFor = (
  document: SharedDocument,
  email: string | undefined,
): ShareRecipientStatus => {
  const address = normaliseEmail(email ?? "");

  return (
    document.recipients.find((recipient) => recipient.email === address)
      ?.status ?? "pending"
  );
};
