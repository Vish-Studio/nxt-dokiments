import { describe, expect, it } from "vitest";

import { getTemplateById } from "@/lib/market-place";
import type { MarketplaceTemplate } from "@/types/template";

import { getFormSections } from "./form-sections";

const sectionsOf = (id: string) =>
  getFormSections((getTemplateById(id) as MarketplaceTemplate).fields);

describe("getFormSections client section", () => {
  it("calls the client block 'Client details' on every non-NDA document", () => {
    for (const id of [
      "classic-invoice",
      "classic-contract",
      "classic-proposal",
    ]) {
      const client = sectionsOf(id).find((section) => section.id === "to");
      expect(client?.title).toBe("Client details");
    }
  });

  it("keeps the NDA's legal party label", () => {
    const party = sectionsOf("classic-nda").find(
      (section) => section.id === "to",
    );
    expect(party?.title).toBe("Receiving party");
  });

  it("shows plain field labels under Client details, keeping every key", () => {
    const client = sectionsOf("classic-invoice").find(
      (section) => section.id === "to",
    )!;
    const labels = Object.fromEntries(
      client.fields.map((field) => [field.key, field.label]),
    );
    expect(labels.toName).toBe("Client name");
    expect(labels.toEmail).toBe("Email");
    expect(labels.toPhone).toBe("Phone number");
    expect(labels.toAddress).toBe("Address");
  });
});
