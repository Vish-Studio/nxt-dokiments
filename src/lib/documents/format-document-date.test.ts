import { describe, expect, it } from "vitest";

import {
  formatDateTime,
  formatFullDate,
  formatNumericDate,
  formatNumericDateTime,
} from "./format-document-date";

const at = (value: string) => new Date(value).getTime();

describe("formatFullDate / formatDateTime", () => {
  it("formats in en-GB", () => {
    expect(formatFullDate(at("2026-06-18T09:30:00"))).toBe("18 Jun 2026");
    expect(formatDateTime(at("2026-06-18T09:30:00"))).toBe("Thu 18 Jun, 09:30");
  });
});

describe("formatNumericDate / formatNumericDateTime", () => {
  it("formats as dd/mm/yy", () => {
    expect(formatNumericDate(at("2026-06-08T09:30:00"))).toBe("08/06/26");
    expect(formatNumericDateTime(at("2026-06-08T09:30:00"))).toBe("08/06/26, 09:30");
  });
});
