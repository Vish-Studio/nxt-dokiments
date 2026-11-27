import type { Client, ClientInput } from "@/types/client";

/** A client field the server requires that the document left empty or invalid. */
export type MissingClientField = "name" | "email" | "phone";

/**
 * What a document's client block can become in My Clients.
 *
 * - `ok: true`: `input` is ready for `useCreateClientMutation`.
 * - `ok: false`: the server would refuse it; `missing` lists, in display
 *   order, what to add first.
 */
export type ClientFromDocument =
  | { ok: true; input: ClientInput }
  | { ok: false; missing: MissingClientField[] };

// Loose on purpose: the server's zod `.email()` is the real check. This only
// spots values that are plainly not an address, so the prompt can say so.
const looksLikeEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/** The client's name on a document, from whichever party key the template uses. */
export const documentClientName = (values: Record<string, string>) =>
  (values.toName ?? values.partyTwo ?? "").trim();

/**
 * Builds a new client from a document's client fields (`toName`, `toEmail`,
 * `toPhone`, `toAddress`, `toBrn`, or an NDA's `partyTwo` keys), so a client
 * typed into a document can be saved to My Clients.
 *
 * Mirrors `ClientSchema` (`src/lib/api/client-schema.ts`): the name, a valid
 * email and a phone are required. The document has one name field, so it
 * becomes both the client's `companyName` and contact `name`, the same way
 * `clientPrefillValues` reads `companyName || name` back. Never throws.
 *
 * @example
 * clientFromDocument({ toName: "Northline Studio", toEmail: "hi@northline.mu" });
 * // { ok: false, missing: ["phone"] }
 */
export const clientFromDocument = (
  values: Record<string, string>,
): ClientFromDocument => {
  const name = documentClientName(values);
  const email = (values.toEmail ?? "").trim();
  const phone = (values.toPhone ?? "").trim();

  const missing: MissingClientField[] = [];
  if (!name) missing.push("name");
  if (!looksLikeEmail(email)) missing.push("email");
  if (!phone) missing.push("phone");
  if (missing.length > 0) return { ok: false, missing };

  return {
    ok: true,
    input: {
      address: (values.toAddress ?? values.partyTwoAddress ?? "").trim(),
      brn: (values.toBrn ?? "").trim(),
      companyName: name,
      email,
      name,
      nationalId: "",
      phone,
    },
  };
};

/**
 * The saved client a document's client block already matches, if any: same
 * email, or the same name, ignoring case and surrounding spaces. Used to skip
 * the "Save this client?" prompt for someone already in My Clients.
 */
export const findSavedClient = (
  clients: readonly Client[],
  values: Record<string, string>,
): Client | undefined => {
  const name = documentClientName(values).toLocaleLowerCase();
  const email = (values.toEmail ?? "").trim().toLocaleLowerCase();

  return clients.find(
    (client) =>
      (email && client.email.trim().toLocaleLowerCase() === email) ||
      (name &&
        [client.companyName, client.name].some(
          (candidate) => candidate.trim().toLocaleLowerCase() === name,
        )),
  );
};
