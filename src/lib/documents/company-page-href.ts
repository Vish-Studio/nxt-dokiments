/**
 * The company page for a `CompanyDocumentGroup` key
 * (`/my-documents/companies/[key]`). Keys are already URL-safe; encoding keeps
 * it safe if that ever changes.
 */
export const companyPageHref = (key: string) =>
  `/my-documents/companies/${encodeURIComponent(key)}`;

/**
 * "New document" for a company, prefilled: the client from My Clients when the
 * company is in the book, else just its name. The "No client yet" group (no
 * name) gets a plain new document.
 */
export const companyNewDocumentHref = (group: {
  client?: { id: string } | null;
  name: string | null;
}) =>
  group.client
    ? `/my-documents?new=1&client=${encodeURIComponent(group.client.id)}`
    : group.name
      ? `/my-documents?new=1&company=${encodeURIComponent(group.name)}`
      : "/my-documents?new=1";
