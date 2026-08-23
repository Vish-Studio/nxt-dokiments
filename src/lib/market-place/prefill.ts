import type { AuthUser } from "@/types/auth";
import type { Client } from "@/types/client";
import type { TemplateField } from "@/types/template";

/**
 * Maps a saved client, or the signed-in user's own profile, onto a template's
 * field values so the editor doesn't start from an empty form.
 *
 * Field keys are not uniform across document types: most use `fromName`/`toName`
 * (see `fromToFields` in `documents.ts`), but an NDA names its parties
 * `partyOne`/`partyTwo` instead. Each rule therefore lists candidate keys in
 * priority order and only the first one the template actually declares is
 * written — so one rule set covers every document type, and a type that has no
 * matching key (e.g. `meeting-minutes-action-brief`, which has no counterparty)
 * simply receives nothing.
 */
type PrefillRule<TSource> = {
  /** Candidate template field keys, most preferred first. */
  keys: string[];
  /** Value to write, or `""` to skip this rule for this source. */
  value: (source: TSource) => string;
};

/**
 * Recipient-side rules. `toName` receives the company rather than the contact
 * person, since documents normally address the business entity; the contact name
 * is the fallback for clients stored without a company.
 *
 * `toEmail`/`toPhone`/`toBrn` only exist on the billing document types (see
 * `recipientContactFields`), so on a contract or a letter those rules find no
 * matching key and are skipped.
 */
const CLIENT_RULES: PrefillRule<Client>[] = [
  {
    keys: ["toName", "partyTwo"],
    value: (client) => client.companyName || client.name,
  },
  { keys: ["toAddress", "partyTwoAddress"], value: (client) => client.address },
  { keys: ["toEmail"], value: (client) => client.email },
  { keys: ["toPhone"], value: (client) => client.phone },
  { keys: ["toBrn"], value: (client) => client.brn },
];

/**
 * Sender-side rules, filled from the user's own profile. Mirrors the recipient
 * rules so an NDA's `partyOne` (disclosing party) gets the user while `partyTwo`
 * (receiving party) gets the client.
 */
const SENDER_RULES: PrefillRule<AuthUser>[] = [
  {
    keys: ["fromName", "partyOne"],
    value: (user) => user.companyName || user.fullName || user.displayName,
  },
  {
    keys: ["fromAddress", "partyOneAddress"],
    value: (user) => user.address ?? "",
  },
];

/**
 * Applies a rule set against the keys a template actually declares.
 *
 * Empty values are omitted rather than written as `""`, so prefilling from a
 * client with no BRN leaves a BRN the user already typed untouched instead of
 * blanking it.
 */
const applyRules = <TSource>(
  rules: PrefillRule<TSource>[],
  source: TSource,
  fields: TemplateField[],
): Record<string, string> => {
  const templateKeys = new Set(fields.map((field) => field.key));
  const values: Record<string, string> = {};

  rules.forEach((rule) => {
    const key = rule.keys.find((candidate) => templateKeys.has(candidate));
    if (!key) return;

    const value = rule.value(source);
    if (!value) return;

    values[key] = value;
  });

  return values;
};

/**
 * Values to merge into a draft when a client is picked in the editor.
 *
 * @param client - The saved client to prefill from.
 * @param fields - The target template's field definitions.
 * @returns Only the recipient keys this template declares and this client has a
 *   value for — merge over the existing draft rather than replacing it.
 */
export const clientPrefillValues = (
  client: Client,
  fields: TemplateField[],
): Record<string, string> => applyRules(CLIENT_RULES, client, fields);

/**
 * Values to seed a brand-new document's draft with, from the signed-in user's
 * profile. The sender block is identical on every document a user creates, so
 * there is nothing to pick — it is applied automatically on `startNewDocument`.
 *
 * Must not be applied when opening an existing document; that would overwrite
 * saved values.
 *
 * @param user - The signed-in user; `null`/`undefined` before the session resolves
 *   (`useAuthStore` holds `AuthUser | null`).
 * @param fields - The target template's field definitions.
 * @returns The sender keys this template declares, or `{}` when `user` is absent
 *   or their profile has no company/address set.
 */
export const senderPrefillValues = (
  user: AuthUser | null | undefined,
  fields: TemplateField[],
): Record<string, string> =>
  user ? applyRules(SENDER_RULES, user, fields) : {};

/**
 * Whether picking a client could fill anything on this template.
 *
 * `false` for document types with no counterparty (`meeting-minutes-action-brief`),
 * where the picker should not render at all rather than appear and do nothing.
 */
export const supportsClientPrefill = (fields: TemplateField[]): boolean => {
  const templateKeys = new Set(fields.map((field) => field.key));
  return CLIENT_RULES.some((rule) =>
    rule.keys.some((candidate) => templateKeys.has(candidate)),
  );
};
