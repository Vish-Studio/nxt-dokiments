import type { TemplateField } from "@/types/template";
import { cvListConfigs, cvListKeys, isCvListKey } from "./cv-lists";
import { withPartyContacts } from "./party-fields";

const partyKeys = {
  from: [
    "fromName",
    "fromPhone",
    "fromEmail",
    "fromAddress",
    "fromBrn",
    "partyOne",
    "partyOneAddress",
  ],
  to: [
    "toName",
    "toPhone",
    "toEmail",
    "toAddress",
    "toBrn",
    "partyTwo",
    "partyTwoAddress",
  ],
};
/**
 * Labels for the client block under the "Client details" heading. Display
 * only: templates and saved snapshots keep their own labels ("To", "Recipient
 * email"), which read oddly once the section already says who it is for.
 */
const clientFieldLabels: Record<string, string> = {
  toAddress: "Address",
  toBrn: "BRN (optional)",
  toEmail: "Email",
  toName: "Client name",
  toPhone: "Phone number",
};

const paymentKeys = [
  "subtotal",
  "tax",
  "total",
  "fee",
  "price",
  "projectFee",
  "additionalFee",
  "amountPaid",
  "paymentMethod",
  "paymentTerms",
  "paymentInstructions",
];

const cvPersonalKeys = [
  "fullName",
  "jobTitle",
  "email",
  "phone",
  "location",
  "website",
];

/** CV sections: personal details, a short bio, then one section per list. */
const getCvFormSections = (fields: TemplateField[]) => {
  const sections = [
    { id: "details", title: "Document details" },
    { id: "personal", title: "Personal details" },
    { id: "about", title: "About" },
    ...cvListKeys.map((id) => ({
      id,
      title: cvListConfigs[id].isOptional
        ? `${cvListConfigs[id].title} (optional)`
        : cvListConfigs[id].title,
    })),
  ].map((section) => ({ ...section, fields: [] as TemplateField[] }));
  for (const field of fields) {
    const id = cvPersonalKeys.includes(field.key)
      ? "personal"
      : isCvListKey(field.key)
        ? field.key
        : field.key === "skillsDisplay"
          ? "skills"
          : field.key === "additionalTitle"
            ? "additional"
            : "about";
    sections.find((section) => section.id === id)!.fields.push(field);
  }
  return sections;
};

/** Presentation only: every field retains its original key and saved value. */
export const getFormSections = (fields: TemplateField[]) => {
  if (fields.some((field) => field.key === "jobTitle"))
    return getCvFormSections(fields);
  const sections = [
    { id: "details", title: "Document details" },
    {
      id: "from",
      title: fields.some((field) => field.key === "partyOne")
        ? "Disclosing party"
        : "Your details",
    },
    {
      id: "to",
      // Whoever the document is for is a client, on every document type;
      // only an NDA keeps its legal party label.
      title: fields.some((field) => field.key === "partyTwo")
        ? "Receiving party"
        : "Client details",
    },
    {
      id: "content",
      title: fields.some((field) => field.key === "items")
        ? "Items"
        : "Content",
    },
    { id: "payment", title: "Amounts" },
    { id: "signatures", title: "Signatures & closing" },
  ].map((section) => ({ ...section, fields: [] as TemplateField[] }));

  for (const field of withPartyContacts(fields)) {
    let id = "content";
    if (partyKeys.from.includes(field.key)) id = "from";
    else if (partyKeys.to.includes(field.key)) id = "to";
    else if (
      /signature/i.test(field.key) ||
      ["closing", "approval"].includes(field.key)
    )
      id = "signatures";
    else if (paymentKeys.includes(field.key)) id = "payment";
    else if (
      field.type === "date" ||
      /Number$/.test(field.key) ||
      [
        "title",
        "subject",
        "reference",
        "originalAgreement",
        "reportingPeriod",
        "facilitator",
      ].includes(field.key)
    )
      id = "details";
    sections.find((section) => section.id === id)!.fields.push(field);
  }
  for (const side of ["from", "to"] as const) {
    sections
      .find((section) => section.id === side)!
      .fields.sort(
        (a, b) =>
          partyKeys[side].indexOf(a.key) - partyKeys[side].indexOf(b.key),
      );
  }
  const client = sections.find((section) => section.id === "to")!;
  if (client.title === "Client details") {
    client.fields = client.fields.map((field) =>
      clientFieldLabels[field.key]
        ? { ...field, label: clientFieldLabels[field.key] }
        : field,
    );
  }
  return sections;
};
