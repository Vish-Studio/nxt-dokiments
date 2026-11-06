import { describe, expect, it } from "vitest";

import type { UserDocument } from "@/types/template";

import { buildDuplicateDraft } from "./duplicate-draft";

const source = (overrides: Partial<UserDocument>) =>
  ({
    createdAt: "2026-10-01T00:00:00.000Z",
    id: "doc_1",
    name: "June Retainer",
    templateId: "invoice",
    updatedAt: "2026-10-02T00:00:00.000Z",
    values: { notes: "Net 30", title: "Lumina Invoice" },
    ...overrides,
  }) as UserDocument;

describe("buildDuplicateDraft", () => {
  it("prefixes the name and the title, and keeps other values", () => {
    expect(buildDuplicateDraft(source({}))).toEqual({
      name: "Copy of June Retainer",
      values: { notes: "Net 30", title: "Copy of Lumina Invoice" },
    });
  });

  it("leaves values untouched when there is no title", () => {
    const { values } = buildDuplicateDraft(
      source({ values: { notes: "Net 30" } }),
    );

    expect(values).toEqual({ notes: "Net 30" });
  });

  it("keeps the name within 200 characters", () => {
    const { name } = buildDuplicateDraft(source({ name: "x".repeat(200) }));

    expect(name).toHaveLength(200);
    expect(name.startsWith("Copy of ")).toBe(true);
  });

  it("does not mutate the source values", () => {
    const original = source({});

    buildDuplicateDraft(original);

    expect(original.values.title).toBe("Lumina Invoice");
  });
});
