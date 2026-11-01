import { describe, expect, it } from "vitest";

import {
  clampLevel,
  cvListConfigs,
  cvListRows,
  isCvListEmpty,
  readCvList,
  visibleCvRows,
  writeCvList,
} from "./cv-lists";

describe("cv lists", () => {
  it("round-trips rows through the versioned encoding", () => {
    const rows = [{ level: "80", name: "TypeScript" }];
    expect(readCvList(writeCvList(rows))).toEqual(rows);
  });

  it("returns null for plain text and malformed values", () => {
    expect(readCvList("Worked at Acme")).toBeNull();
    expect(readCvList("dokiments-cv-list-v1:{oops")).toBeNull();
    expect(readCvList('dokiments-cv-list-v1:[{"a":1}]')).toBeNull();
  });

  it("keeps legacy text verbatim as the primary field", () => {
    expect(cvListRows("experience", "Worked at Acme")[0].title).toBe(
      "Worked at Acme",
    );
    expect(cvListRows("experience", "  ")).toEqual([]);
  });

  it("clamps levels to 0-100", () => {
    expect(clampLevel("150")).toBe(100);
    expect(clampLevel("-5")).toBe(0);
    expect(clampLevel("abc")).toBe(0);
    expect(clampLevel("72.4")).toBe(72);
  });

  it("treats rows with only a default level as empty", () => {
    expect(isCvListEmpty([{ level: "70", name: "" }])).toBe(true);
    expect(isCvListEmpty([{ level: "70", name: "French" }])).toBe(false);
  });
});

describe("custom cv section", () => {
  it("is optional and omitted when its rows are blank", () => {
    expect(cvListConfigs.additional.isOptional).toBe(true);
    expect(cvListConfigs.skills.isOptional).toBe(true);
    expect(
      visibleCvRows(
        "additional",
        writeCvList([{ description: "", period: "", subtitle: "", title: "" }]),
      ),
    ).toHaveLength(0);
  });
});
