import type { TemplateField } from "@/types/template";

/** Add optional contact inputs to old catalog entries/snapshots without rewriting them. */
export const withPartyContacts = (fields: TemplateField[]): TemplateField[] => {
  const contacts: TemplateField[] = [];
  for (const side of ["from", "to"]) {
    if (!fields.some((field) => field.key === `${side}Name`)) continue;
    for (const [suffix, label] of [["Phone", "phone number"], ["Email", "email"]]) {
      const key = side + suffix;
      if (!fields.some((field) => field.key === key)) contacts.push({ key, label: `${side === "from" ? "Sender" : "Recipient"} ${label}`, type: "text" });
    }
  }
  return fields.flatMap((field) => field.key === "fromName" || field.key === "toName"
    ? [field, ...contacts.filter((contact) => contact.key.startsWith(field.key === "fromName" ? "from" : "to"))]
    : [field]);
};
