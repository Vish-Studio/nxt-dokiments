import { describe, expect, it } from "vitest";

import { formatDateTime, formatFullDate, formatRelativeDate } from "./format-document-date";

const now = new Date("2026-06-20T15:00:00").getTime();
const at = (value: string) => new Date(value).getTime();

describe("formatRelativeDate", () => {
  it("says today, yesterday and days ago within a week", () => {
    expect(formatRelativeDate(at("2026-06-20T08:00:00"), now)).toBe("Today");
    expect(formatRelativeDate(at("2026-06-19T23:00:00"), now)).toBe("Yesterday");
    expect(formatRelativeDate(at("2026-06-16T12:00:00"), now)).toBe("4 days ago");
  });

  it("falls back to a short date this year and a full date before", () => {
    expect(formatRelativeDate(at("2026-03-02T12:00:00"), now)).toBe("2 Mar");
    expect(formatRelativeDate(at("2025-12-24T12:00:00"), now)).toBe("24 Dec 2025");
  });
});

describe("formatFullDate / formatDateTime", () => {
  it("formats in en-GB", () => {
    expect(formatFullDate(at("2026-06-18T09:30:00"))).toBe("18 Jun 2026");
    expect(formatDateTime(at("2026-06-18T09:30:00"))).toBe("Thu 18 Jun, 09:30");
  });
});
